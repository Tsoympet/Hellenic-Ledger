const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing interactions with:", deployer.address);

  const politeiaAddress = "0x..."; // Replace with deployed address
  const talantonAddress = "0x..."; // Replace with deployed address
  const citizenIDAddress = "0x..."; // Replace with deployed address

  const HellenicPoliteia = await ethers.getContractFactory("HellenicPoliteia");
  const Talanton = await ethers.getContractFactory("Talanton");
  const CitizenID = await ethers.getContractFactory("CitizenID");

  const politeia = HellenicPoliteia.attach(politeiaAddress);
  const talanton = Talanton.attach(talantonAddress);
  const citizenID = CitizenID.attach(citizenIDAddress);

  // Verify deployer
  await citizenID.verifyUser(deployer.address);
  console.log("Verified deployer:", await citizenID.isVerified(deployer.address));

  // Stake Talanton before mining
  const stakeAmount = ethers.parseEther("32000");
  await talanton.approve(talantonAddress, stakeAmount);
  await talanton.stake(stakeAmount);
  console.log("Staked Talanton:", ethers.formatEther(await talanton.stakedBalance(deployer.address)));

  // Mine with nonce
  const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
  const target = ethers.MaxUint256.div(1000);
  let nonce = 0;
  let solution;
  do {
    solution = ethers.keccak256(ethers.solidityPacked(["address", "bytes32", "uint256", "uint256"], [deployer.address, blockHash, nonce, stakeAmount]));
    nonce++;
  } while (ethers.toBigInt(solution) > target);
  await talanton.mine(nonce - 1);
  console.log("Mined with nonce:", nonce - 1);

  // Vote on an election
  await politeia.startElection("Strategos", deployer.address);
  await politeia.voteForRole("Strategos", 0);
  console.log("Voted for Strategos election 0");

  // Propose and vote on a motion
  await politeia.proposeSilverMotion("Test Motion", 5, 10, "0x");
  await politeia.voteForMotion(0, true);
  console.log("Proposed and voted on motion 0");

  console.log("Test interactions completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
