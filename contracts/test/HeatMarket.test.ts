import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";

const E18 = (n: string | number) => ethers.parseEther(n.toString());

async function deployFixture() {
  const [owner, oracle, alice, bob, carol] = await ethers.getSigners();

  const KAI = await ethers.getContractFactory("KAIToken");
  const kai = await KAI.deploy(await owner.getAddress());
  await kai.waitForDeployment();

  const Market = await ethers.getContractFactory("HeatMarket");
  const market = await Market.deploy(
    await kai.getAddress(),
    await oracle.getAddress(),
    await owner.getAddress(), // factory placeholder
    "Mr Beast",
    "Pop Culture",
    "https://example.com/mrbeast.jpg",
    E18(1) // initial price = 1.00 KAI
  );
  await market.waitForDeployment();

  // fund traders
  for (const s of [alice, bob, carol]) {
    await kai.mint(await s.getAddress(), E18(10_000));
    await kai.connect(s).approve(await market.getAddress(), ethers.MaxUint256);
  }

  // Seed the insurance fund so profitable positions have a counterparty pool.
  await kai.mint(await owner.getAddress(), E18(1_000_000));
  await kai.connect(owner).approve(await market.getAddress(), ethers.MaxUint256);
  await market.connect(owner).fundInsurance(E18(1_000_000));

  return { owner, oracle, alice, bob, carol, kai, market };
}

async function open(
  market: any,
  signer: Signer,
  collateral: bigint,
  leverage: number,
  isLong: boolean
) {
  return market.connect(signer).openPosition(collateral, leverage, isLong);
}

describe("HeatMarket", () => {
  it("opens a long and books OI + collateral correctly", async () => {
    const { market, kai, alice } = await deployFixture();
    await open(market, alice, E18(100), 5, true);

    const pos = await market.getPosition(await alice.getAddress());
    expect(pos.open).to.equal(true);
    expect(pos.isLong).to.equal(true);
    expect(pos.leverage).to.equal(5);
    expect(pos.collateral).to.equal(E18(100));
    expect(pos.size).to.equal(E18(500));
    expect(pos.entryPrice).to.equal(E18(1));

    const snap = await market.getMarketSnapshot();
    expect(snap.longOI).to.equal(E18(500));
    expect(snap.shortOI).to.equal(0n);
    expect(snap.longPctBps).to.equal(10_000n);
    expect(snap.shortPctBps).to.equal(0n);

    // Contract balance = insurance fund (1M) + alice's posted collateral (100)
    expect(await kai.balanceOf(await market.getAddress())).to.equal(
      E18(1_000_000) + E18(100)
    );
  });

  it("rejects leverage above the cap and zero collateral", async () => {
    const { market, alice } = await deployFixture();
    await expect(open(market, alice, E18(100), 21, true)).to.be.revertedWith(
      "HeatMarket: bad leverage"
    );
    await expect(open(market, alice, 0n, 5, true)).to.be.revertedWith(
      "HeatMarket: zero collateral"
    );
  });

  it("rejects a second open from the same user while open", async () => {
    const { market, alice } = await deployFixture();
    await open(market, alice, E18(100), 5, true);
    await expect(open(market, alice, E18(50), 2, false)).to.be.revertedWith(
      "HeatMarket: position exists"
    );
  });

  it("settles profit on a long when price doubles", async () => {
    const { market, kai, oracle, alice } = await deployFixture();
    await open(market, alice, E18(100), 5, true); // size = 500, entry = 1

    await market.connect(oracle).updatePrice(E18(2)); // mark = 2 → +100% on size 500 → +500
    const view = await market.getPosition(await alice.getAddress());
    expect(view.unrealizedPnl).to.equal(E18(500));

    const before = await kai.balanceOf(await alice.getAddress());
    await market.connect(alice).closePosition();
    const after = await kai.balanceOf(await alice.getAddress());
    expect(after - before).to.equal(E18(600)); // collateral 100 + pnl 500
  });

  it("settles loss on a long when price falls and clamps payout at zero if wiped out", async () => {
    const { market, kai, oracle, alice } = await deployFixture();
    await open(market, alice, E18(100), 5, true); // size = 500, entry = 1
    // collateral 100, leverage 5 → ~20% price drop wipes out collateral.
    await market.connect(oracle).updatePrice(E18("0.7")); // -30% on size 500 → -150

    const before = await kai.balanceOf(await alice.getAddress());
    await market.connect(alice).closePosition();
    const after = await kai.balanceOf(await alice.getAddress());
    expect(after - before).to.equal(0n); // payout floored at 0
  });

  it("profits a short when price drops", async () => {
    const { market, kai, oracle, alice } = await deployFixture();
    await open(market, alice, E18(100), 5, false); // short, size 500

    await market.connect(oracle).updatePrice(E18("0.8")); // -20% on size 500 → +100 for short

    const before = await kai.balanceOf(await alice.getAddress());
    await market.connect(alice).closePosition();
    const after = await kai.balanceOf(await alice.getAddress());
    expect(after - before).to.equal(E18(200)); // collateral 100 + pnl 100
  });

  it("permits anyone to liquidate when loss >= 95% of collateral and pays bounty", async () => {
    const { market, kai, oracle, alice, bob } = await deployFixture();
    await open(market, alice, E18(100), 10, true); // size = 1000, entry = 1
    // 9.5% drop → loss = 95 KAI → just at threshold
    await market.connect(oracle).updatePrice(E18("0.905")); // -9.5%

    // Bob liquidates Alice
    const bobBefore = await kai.balanceOf(await bob.getAddress());
    const aliceBefore = await kai.balanceOf(await alice.getAddress());

    await market.connect(bob).liquidate(await alice.getAddress());

    const bobAfter = await kai.balanceOf(await bob.getAddress());
    const aliceAfter = await kai.balanceOf(await alice.getAddress());

    // Alice gets tiny residual (5% of collateral = 5 KAI), Bob gets 5% of forfeited 95 = 4.75
    expect(aliceAfter - aliceBefore).to.equal(E18(5));
    expect(bobAfter - bobBefore).to.equal(E18("4.75"));

    const pos = await market.getPosition(await alice.getAddress());
    expect(pos.open).to.equal(false);

    const snap = await market.getMarketSnapshot();
    expect(snap.longOI).to.equal(0n);
  });

  it("refuses liquidation of a healthy position", async () => {
    const { market, oracle, alice, bob } = await deployFixture();
    await open(market, alice, E18(100), 5, true); // size 500
    await market.connect(oracle).updatePrice(E18("0.95")); // -5% on size 500 → -25, well under threshold
    await expect(
      market.connect(bob).liquidate(await alice.getAddress())
    ).to.be.revertedWith("HeatMarket: not liquidatable");
  });

  it("reports long/short sentiment percentages", async () => {
    const { market, alice, bob } = await deployFixture();
    await open(market, alice, E18(100), 2, true);   // long size 200
    await open(market, bob,   E18(100), 1, false);  // short size 100

    const snap = await market.getMarketSnapshot();
    // long = 200/300 = 6666 bps, short = 3334 bps
    expect(snap.longPctBps).to.equal(6666n);
    expect(snap.shortPctBps).to.equal(3334n);
    expect(snap.volumeAccum).to.equal(E18(300));
  });

  it("rejects price updates from non-oracle", async () => {
    const { market, alice } = await deployFixture();
    await expect(market.connect(alice).updatePrice(E18(2))).to.be.revertedWith(
      "HeatMarket: not oracle"
    );
  });

  it("debits and credits the insurance fund as positions settle", async () => {
    const { market, oracle, alice } = await deployFixture();
    const fundBefore = await market.insuranceFund();

    // Win: alice +500 KAI, insurance should drop by 500
    await open(market, alice, E18(100), 5, true);
    await market.connect(oracle).updatePrice(E18(2));
    await market.connect(alice).closePosition();
    expect(await market.insuranceFund()).to.equal(fundBefore - E18(500));

    // Loss: alice loses all 100 KAI collateral, insurance grows by 100
    const fundMid = await market.insuranceFund();
    await market.connect(oracle).updatePrice(E18(2)); // reset entry baseline
    await open(market, alice, E18(100), 5, true);    // size 500, entry 2
    await market.connect(oracle).updatePrice(E18("1.5")); // -25% on size 500 = -125 → capped at -100
    await market.connect(alice).closePosition();
    expect(await market.insuranceFund()).to.equal(fundMid + E18(100));
  });

  it("allows the oracle to rotate itself", async () => {
    const { market, oracle, bob } = await deployFixture();
    await market.connect(oracle).setOracle(await bob.getAddress());
    expect(await market.oracle()).to.equal(await bob.getAddress());
    // old oracle now powerless
    await expect(market.connect(oracle).updatePrice(E18(2))).to.be.revertedWith(
      "HeatMarket: not oracle"
    );
  });
});
