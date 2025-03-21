const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TitanicNFT", function () {
  let titanicNFT;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const TitanicNFT = await ethers.getContractFactory("TitanicNFT");
    titanicNFT = await upgrades.deployProxy(TitanicNFT, [ethers.ZeroAddress], { initializer: "initialize" });
    await titanicNFT.waitForDeployment();
  });

  it("should mint an NFT", async function () {
    await titanicNFT.mint(user1.address);
    expect(await titanicNFT.balanceOf(user1.address)).to.equal(1);
    expect(await titanicNFT.ownerOf(1)).to.equal(user1.address);
  });
});
