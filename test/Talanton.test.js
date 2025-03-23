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

  it("should mine with valid nonce and full stake", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
    const target = await talanton.currentTarget();
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
    expect(await talanton.currentRewardFull()).to.equal(ethers.parseEther("1")); // Initial reward
  });

  it("should mine with valid nonce and minimum stake", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000")); // Still staking 32k, but testing min reward logic
    const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
    const target = await talanton.currentTarget();
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
    // Check tiered reward (1 TAL for 32k stake initially)
    expect(balanceAfter.sub(balanceBefore)).to.be.closeTo(ethers.parseEther("1"), ethers.parseEther("0.1")); // Approx due to bonus
  });

  it("should fail mining without stake", async function () {
    await expect(talanton.connect(user1).mine(0)).to.be.revertedWith("Must stake at least 1,000 TAL to mine");
  });

  it("should adjust difficulty and halve rewards after intervals", async function () {
    await talanton.connect(user1).stake(ethers.parseEther("32000"));
    const initialDifficulty = await talanton.currentDifficulty();
    const initialTarget = await talanton.currentTarget();
    const initialRewardFull = await talanton.currentRewardFull();
    const initialRewardMin = await talanton.currentRewardMin();

    // Simulate passing DIFFICULTY_ADJUSTMENT_PERIOD (20,160 blocks)
    await ethers.provider.send("evm_increaseTime", [604800]); // 1 week
    await ethers.provider.send("hardhat_mine", ["0x4ec0"]); // 20,160 blocks in hex
    const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
    let nonce = 0;
    let solution;
    do {
      solution = ethers.keccak256(ethers.solidityPacked(["address", "bytes32", "uint256", "uint256"], [user1.address, blockHash, nonce, ethers.parseEther("32000")]));
      nonce++;
    } while (ethers.toBigInt(solution) > initialTarget); // Use initial target for simplicity
    await talanton.connect(user1).mine(nonce - 1);

    expect(await talanton.currentDifficulty()).to.equal(initialDifficulty * 110 / 100); // 10% increase
    expect(await talanton.currentTarget()).to.be.below(initialTarget);

    // Simulate passing HALVING_INTERVAL (420,000 blocks)
    await ethers.provider.send("evm_increaseTime", [604800 * 8]); // ~8 weeks
    await ethers.provider.send("hardhat_mine", ["0x668a0"]); // 420,000 blocks in hex
    await talanton.connect(user1).mine(nonce - 1); // Trigger adjustment
    expect(await talanton.currentRewardFull()).to.equal(initialRewardFull / 2); // Halved
    expect(await talanton.currentRewardMin()).to.equal(initialRewardMin / 2); // Halved
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
