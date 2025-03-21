const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("DisputeResolver", function () {
  let disputeResolver, talanton;
  let deployer, user1, user2;

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    const Talanton = await ethers.getContractFactory("Talanton");
    const DisputeResolver = await ethers.getContractFactory("DisputeResolver");

    talanton = await upgrades.deployProxy(Talanton, [ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await talanton.waitForDeployment();

    disputeResolver = await upgrades.deployProxy(DisputeResolver, [talanton.target, ethers.ZeroAddress, deployer.address], { initializer: "initialize" });
    await disputeResolver.waitForDeployment();
  });

  it("should file and resolve a dispute", async function () {
    await talanton.transfer(user1.address, ethers.parseEther("100"));
    await talanton.connect(user1).approve(disputeResolver.target, ethers.parseEther("100"));
    await disputeResolver.connect(user1).fileDispute(user2.address, ethers.parseEther("100"), "Test dispute");
    await disputeResolver.resolveDispute(0, true);
    expect(await talanton.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
  });
});
