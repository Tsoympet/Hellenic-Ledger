const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("QuestNFT", function () {
  let questNFT;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const QuestNFT = await ethers.getContractFactory("QuestNFT");
    questNFT = await upgrades.deployProxy(QuestNFT, [ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await questNFT.waitForDeployment();
  });

  it("should mint an NFT", async function () {
    await questNFT.mint(user1.address);
    expect(await questNFT.balanceOf(user1.address)).to.equal(1);
    expect(await questNFT.ownerOf(1)).to.equal(user1.address);
  });
});
