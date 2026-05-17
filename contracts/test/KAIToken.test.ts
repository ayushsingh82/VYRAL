import { expect } from "chai";
import { ethers } from "hardhat";

describe("KAIToken", () => {
  it("has the expected metadata and supports mint + faucet", async () => {
    const [owner, alice] = await ethers.getSigners();
    const KAI = await ethers.getContractFactory("KAIToken");
    const kai = await KAI.deploy(owner.address);
    await kai.waitForDeployment();

    expect(await kai.name()).to.equal("Kai");
    expect(await kai.symbol()).to.equal("KAI");
    expect(await kai.decimals()).to.equal(18);

    // mint
    await kai.mint(alice.address, ethers.parseEther("100"));
    expect(await kai.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));

    // faucet (caller receives FAUCET_AMOUNT)
    await kai.connect(alice).faucet();
    expect(await kai.balanceOf(alice.address)).to.equal(
      ethers.parseEther("100") + (await kai.FAUCET_AMOUNT())
    );
  });

  it("transfers correctly between accounts", async () => {
    const [owner, alice, bob] = await ethers.getSigners();
    const KAI = await ethers.getContractFactory("KAIToken");
    const kai = await KAI.deploy(owner.address);
    await kai.mint(alice.address, ethers.parseEther("50"));

    await kai.connect(alice).transfer(bob.address, ethers.parseEther("20"));
    expect(await kai.balanceOf(alice.address)).to.equal(ethers.parseEther("30"));
    expect(await kai.balanceOf(bob.address)).to.equal(ethers.parseEther("20"));
  });
});
