import { expect } from "chai";
import { ethers } from "hardhat";

describe("VyralToken", () => {
  it("has the expected metadata and supports mint + faucet", async () => {
    const [owner, alice] = await ethers.getSigners();
    const VYR = await ethers.getContractFactory("VyralToken");
    const vyr = await VYR.deploy(owner.address);
    await vyr.waitForDeployment();

    expect(await vyr.name()).to.equal("Vyral");
    expect(await vyr.symbol()).to.equal("VYR");
    expect(await vyr.decimals()).to.equal(18);

    await vyr.mint(alice.address, ethers.parseEther("100"));
    expect(await vyr.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));

    await vyr.connect(alice).faucet();
    expect(await vyr.balanceOf(alice.address)).to.equal(
      ethers.parseEther("100") + (await vyr.FAUCET_AMOUNT())
    );
  });

  it("transfers correctly between accounts", async () => {
    const [owner, alice, bob] = await ethers.getSigners();
    const VYR = await ethers.getContractFactory("VyralToken");
    const vyr = await VYR.deploy(owner.address);
    await vyr.mint(alice.address, ethers.parseEther("50"));

    await vyr.connect(alice).transfer(bob.address, ethers.parseEther("20"));
    expect(await vyr.balanceOf(alice.address)).to.equal(ethers.parseEther("30"));
    expect(await vyr.balanceOf(bob.address)).to.equal(ethers.parseEther("20"));
  });
});
