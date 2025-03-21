const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("RelicNFT", function () {
  let relicNFT;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const RelicNFT = await ethers.getContractFactory("RelicNFT");
    relicNFT = await upgrades.deployProxy(RelicNFT, [ethers.ZeroAddress], { initializer: "initialize" });
    await relicNFT.waitForDeployment();
  });

  it("should mint an NFT", async function () {
    await relicNFT.mint(user1.address);
    expect(await relicNFT.balanceOf(user1.address)).to.equal(1);
    expect(await relicNFT.ownerOf(1)).to.equal(user1.address);
  });
});
