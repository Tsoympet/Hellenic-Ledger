const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545"; // BSC Testnet RPC
const TALANTON_ADDRESS = "0x..."; // Replace with deployed Talanton address
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const TALANTON_ABI = [
  "function mine(uint256 nonce) external",
  "function stakedBalance(address user) external view returns (uint256)",
  "function stake(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function currentDifficulty() external view returns (uint256)",
  "function currentTarget() external view returns (uint256)",
  "function currentRewardFull() external view returns (uint256)",
  "function currentRewardMin() external view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const talanton = new ethers.Contract(TALANTON_ADDRESS, TALANTON_ABI, wallet);

const STAKE_AMOUNT = ethers.parseEther("32000");
const MIN_STAKE_FOR_MINING = ethers.parseEther("1000");

async function checkStake() {
  const stakedBalance = await talanton.stakedBalance(wallet.address);
  if (stakedBalance.lt(MIN_STAKE_FOR_MINING)) {
    console.log("Insufficient stake. Staking 32,000 TAL...");
    const balance = await talanton.balanceOf(wallet.address);
    if (balance.lt(STAKE_AMOUNT)) {
      throw new Error("Insufficient TAL balance to stake");
    }
    const approveTx = await talanton.approve(TALANTON_ADDRESS, STAKE_AMOUNT);
    await approveTx.wait();
    const stakeTx = await talanton.stake(STAKE_AMOUNT);
    await stakeTx.wait();
    console.log("Staked 32,000 TAL successfully");
  } else {
    console.log("Already staked sufficient TAL:", ethers.formatEther(stakedBalance));
  }
}

async function mineTalanton() {
  try {
    await checkStake();

    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber - 1);
    const blockHash = block.hash;
    const stakedBalance = await talanton.stakedBalance(wallet.address);
    const currentTarget = await talanton.currentTarget();
    const currentDifficulty = await talanton.currentDifficulty();
    const currentRewardFull = await talanton.currentRewardFull();
    const currentRewardMin = await talanton.currentRewardMin();

    console.log("Mining for block:", blockNumber - 1);
    console.log("Block hash:", blockHash);
    console.log("Staked balance:", ethers.formatEther(stakedBalance));
    console.log("Current difficulty:", currentDifficulty.toString());
    console.log("Current target:", currentTarget.toString());
    console.log("Current reward (full/min):", ethers.formatEther(currentRewardFull), "/", ethers.formatEther(currentRewardMin));

    let nonce = 0;
    let solution;
    while (true) {
      solution = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "bytes32", "uint256", "uint256"],
          [wallet.address, blockHash, nonce, stakedBalance]
        )
      );
      if (ethers.toBigInt(solution) <= currentTarget) {
        console.log("Found valid nonce:", nonce);
        break;
      }
      nonce++;
      if (nonce % 10000 === 0) {
        console.log(`Tested ${nonce} nonces...`);
      }
    }

    const tx = await talanton.mine(nonce, { gasLimit: 100000 });
    const receipt = await tx.wait();
    console.log("Mined successfully! Tx hash:", receipt.hash);

    const balance = await talanton.balanceOf(wallet.address);
    console.log("New balance:", ethers.formatEther(balance), "TAL");
  } catch (error) {
    console.error("Mining failed:", error.message);
  }
}

mineTalanton();
