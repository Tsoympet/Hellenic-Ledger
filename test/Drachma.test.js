const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Drachma", function () {
  let drachma, citizenID;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const CitizenID = await ethers.getContractFactory("CitizenID");
    const Drachma = await ethers.getContractFactory("Drachma");

    citizenID = await upgrades.deployProxy(CitizenID, [deployer.address], { initializer: "initialize" });
    await citizenID.waitForDeployment();

    drachma = await upgrades.deployProxy(Drachma, [citizenID.target, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await drachma.waitForDeployment();
  });

  it("should allow staking", async function () {
    await citizenID.verifyUser(user1.address);
    await drachma.transfer(user1.address, ethers.parseEther("1000"));
    await drachma.connect(user1).stake(ethers.parseEther("1000"));
    expect(await drachma.stakedBalance(user1.address)).to.equal(ethers.parseEther("1000"));
  });

  it("should calculate staking rewards", async function () {
    await citizenID.verifyUser(user1.address);
    await drachma.transfer(user1.address, ethers.parseEther("1000"));
    await drachma.connect(user1).stake(ethers.parseEther("1000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const reward = await drachma.calculateStakingReward(user1.address);
    expect(reward).to.be.above(0);
  }); 

  it("should allow unstaking with rewards", async function () {
    await citizenID.verifyUser(user1.address);
    await drachma.transfer(user1.address, ethers.parseEther("1000"));
    await drachma.connect(user1).stake(ethers.parseEther("1000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const balanceBefore = await drachma.balanceOf(user1.address);
    await drachma.connect(user1).unstake(ethers.parseEther("1000"));
    const balanceAfter = await drachma.balanceOf(user1.address);
    expect(balanceAfter).to.be.above(balanceBefore);
  });
});
