const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Talanton", function () {
  let talanton, citizenID;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const CitizenID = await ethers.getContractFactory("CitizenID");
    const Talanton = await ethers.getContractFactory("Talanton");

    citizenID = await upgrades.deployProxy(CitizenID, [deployer.address], { initializer: "initialize" });
    await citizenID.waitForDeployment();

    talanton = await upgrades.deployProxy(Talanton, [citizenID.target, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await talanton.waitForDeployment();
  });

  it("should allow staking", async function () {
    await citizenID.verifyUser(user1.address);
    await talanton.transfer(user1.address, ethers.parseEther("32000"));
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    expect(await talanton.stakedBalance(user1.address)).to.equal(ethers.parseEther("32000"));
  });

  it("should allow mining", async function () {
    await citizenID.verifyUser(user1.address);
    const balanceBefore = await talanton.balanceOf(user1.address);
    await talanton.connect(user1).mine(ethers.utils.keccak256(ethers.toUtf8Bytes("test")));
    const balanceAfter = await talanton.balanceOf(user1.address);
    expect(balanceAfter).to.be.above(balanceBefore);
  });

  it("should calculate staking rewards", async function () {
    await citizenID.verifyUser(user1.address);
    await talanton.transfer(user1.address, ethers.parseEther("32000"));
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const reward = await talanton.calculateStakingReward(user1.address);
    expect(reward).to.be.above(0);
  });
});
