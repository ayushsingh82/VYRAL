import { expect } from "chai";
import { ethers } from "hardhat";

describe("VyralMarketFactory", () => {
  async function deploy() {
    const [owner, oracle, alice] = await ethers.getSigners();
    const VYR = await ethers.getContractFactory("VyralToken");
    const vyr = await VYR.deploy(await owner.getAddress());
    const Factory = await ethers.getContractFactory("VyralMarketFactory");
    const factory = await Factory.deploy(
      await vyr.getAddress(),
      await oracle.getAddress(),
      await owner.getAddress()
    );
    return { owner, oracle, alice, vyr, factory };
  }

  it("creates markets, indexes by category, and exposes discovery views", async () => {
    const { factory } = await deploy();

    await factory.createMarket("Mr Beast", "Pop Culture", "img1", ethers.parseEther("1"));
    await factory.createMarket("OpenAI", "Pre-IPO", "img2", ethers.parseEther("3.4"));
    await factory.createMarket("Pokemon Go", "Pop Culture", "img3", ethers.parseEther("0.9"));

    expect(await factory.allMarketsLength()).to.equal(3);
    const all = await factory.getAllMarkets();
    expect(all.length).to.equal(3);
    for (const a of all) {
      expect(await factory.isMarket(a)).to.equal(true);
    }

    const popCulture = await factory.getMarketsByCategory("Pop Culture");
    expect(popCulture.length).to.equal(2);
    const preIpo = await factory.getMarketsByCategory("Pre-IPO");
    expect(preIpo.length).to.equal(1);
  });

  it("only the owner can create a market", async () => {
    const { factory, alice } = await deploy();
    await expect(
      factory.connect(alice).createMarket("X", "Y", "z", ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
  });

  it("emits MarketCreated with the deployed address and metadata", async () => {
    const { factory } = await deploy();
    const tx = await factory.createMarket("Tariff", "Trending", "img", ethers.parseEther("2.45"));
    const receipt = await tx.wait();
    const evt = receipt!.logs
      .map((l) => {
        try { return factory.interface.parseLog(l as any); } catch { return null; }
      })
      .find((e) => e?.name === "MarketCreated");
    expect(evt).to.not.equal(undefined);
    expect(evt!.args.subject).to.equal("Tariff");
    expect(evt!.args.category).to.equal("Trending");
    expect(evt!.args.initialPrice).to.equal(ethers.parseEther("2.45"));
  });

  it("wires the new market's VYR and oracle from the factory", async () => {
    const { factory, vyr, oracle } = await deploy();
    const tx = await factory.createMarket("S&P500", "RWA", "img", ethers.parseEther("5.7"));
    const receipt = await tx.wait();
    const created = receipt!.logs
      .map((l) => { try { return factory.interface.parseLog(l as any); } catch { return null; } })
      .find((e) => e?.name === "MarketCreated")!.args.market as string;
    const Market = await ethers.getContractFactory("VyralMarket");
    const m = Market.attach(created) as any;
    expect(await m.vyr()).to.equal(await vyr.getAddress());
    expect(await m.oracle()).to.equal(await oracle.getAddress());
    expect(await m.subject()).to.equal("S&P500");
    expect(await m.markPrice()).to.equal(ethers.parseEther("5.7"));
  });
});
