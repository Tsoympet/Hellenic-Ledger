const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Obolos", function () {
  let obolos, citizenID;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const CitizenID = await ethers.getContractFactory("CitizenID");
    const Obolos = await ethers.getContractFactory("Obolos");

    citizenID = await upgrades.deployProxy(CitizenID, [deployer.address], { initializer: "initialize" });
    await citizenID.waitForDeployment();

    obolos = await upgrades.deployProxy(Obolos, [citizenID.target, ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await obolos.waitForDeployment();
  });

  it("should allow staking", async function () {
    await citizenID.verifyUser(user1.address);
    await obolos.transfer(user1.address, ethers.parseEther("1000"));
    await obolos.connect(user1).stake(ethers.parseEther("1000"));
    expect(await obolos.stakedBalance(user1.address)).to.equal(ethers.parseEther("1000"));
  });

  it("should calculate staking rewards", async function () {
    await citizenID.verifyUser(user1.address);
    await obolos.transfer(user1.address, ethers.parseEther("1000"));
    await obolos.connect(user1).stake(ethers.parseEther("1000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const reward = await obolos.calculateStakingReward(user1.address);
    expect(reward).to.be.above(0);
  });

  it("should allow unstaking with rewards", async function () {
    await citizenID.verifyUser(user1.address);
    await obolos.transfer(user1.address, ethers.parseEther("1000"));
    await obolos.connect(user1).stake(ethers.parseEther("1000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const balanceBefore = await obolos.balanceOf(user1.address);
    await obolos.connect(user1).unstake(ethers.parseEther("1000"));
    const balanceAfter = await obolos.balanceOf(user1.address);
    expect(balanceAfter).to.be.above(balanceBefore);
  });
});
