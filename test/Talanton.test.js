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

    await citizenID.verifyUser(user1.address);
    await talanton.transfer(user1.address, ethers.parseEther("32000"));
  });

  it("should allow staking", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    expect(await talanton.stakedBalance(user1.address)).to.equal(ethers.parseEther("32000"));
  });

  it("should mine with valid nonce and stake", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
    const target = ethers.MaxUint256.div(1000);
    let nonce = 0;
    let solution;
    do {
      solution = ethers.keccak256(ethers.solidityPacked(["address", "bytes32", "uint256", "uint256"], [user1.address, blockHash, nonce, ethers.parseEther("32000")]));
      nonce++;
    } while (ethers.toBigInt(solution) > target);
    const balanceBefore = await talanton.balanceOf(user1.address);
    await talanton.connect(user1).mine(nonce - 1);
    const balanceAfter = await talanton.balanceOf(user1.address);
    expect(balanceAfter).to.be.above(balanceBefore);
  });

  it("should fail mining without stake", async function () {
    await expect(talanton.connect(user1).mine(0)).to.be.revertedWith("Must stake at least 32,000 TAL to mine");
  });

  it("should calculate staking reward", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const reward = await talanton.calculateStakingReward(user1.address);
    expect(reward).to.be.above(0);
  });

  it("should calculate staking bonus", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const bonus = await talanton.calculateStakingBonus(user1.address);
    expect(bonus).to.be.above(0);
  });

  it("should unstake with rewards", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
    await ethers.provider.send("evm_mine", []);
    const balanceBefore = await talanton.balanceOf(user1.address);
    await talanton.connect(user1).unstake(ethers.parseEther("32000"));
    const balanceAfter = await talanton.balanceOf(user1.address);
    expect(balanceAfter).to.be.above(balanceBefore);
  });
});
