const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing interactions with:", deployer.address);

  const politeiaAddress = "0x..."; // Replace with deployed HellenicPoliteia address
  const talantonAddress = "0x..."; // Replace with deployed Talanton address
  const drachmaAddress = "0x..."; // Replace with deployed Drachma address
  const obolosAddress = "0x..."; // Replace with deployed Obolos address
  const citizenIDAddress = "0x..."; // Replace with deployed CitizenID address

  const HellenicPoliteia = await ethers.getContractFactory("HellenicPoliteia");
  const Talanton = await ethers.getContractFactory("Talanton");
  const Drachma = await ethers.getContractFactory("Drachma");
  const Obolos = await ethers.getContractFactory("Obolos");
  const CitizenID = await ethers.getContractFactory("CitizenID");

  const politeia = HellenicPoliteia.attach(politeiaAddress);
  const talanton = Talanton.attach(talantonAddress);
  const drachma = Drachma.attach(drachmaAddress);
  const obolos = Obolos.attach(obolosAddress);
  const citizenID = CitizenID.attach(citizenIDAddress);

  // Verify deployer
  await citizenID.verifyUser(deployer.address);
  console.log("Verified deployer:", await citizenID.isVerified(deployer.address));

  // Stake Talanton
  const stakeAmount = ethers.parseEther("32000");
  await talanton.approve(talantonAddress, stakeAmount);
  await talanton.stake(stakeAmount);
  console.log("Staked Talanton:", ethers.formatEther(await talanton.stakedBalance(deployer.address)));

  // Vote on an election
  await politeia.startElection("Strategos", deployer.address);
  await politeia.voteForRole("Strategos", 0);
  console.log("Voted for Strategos election 0");

  // Propose and vote on a motion
  await politeia.proposeSilverMotion("Test Motion", 5, 10, "0x");
  await politeia.voteForMotion(0, true);
  console.log("Proposed and voted on motion 0");

  // Test interactions complete
  console.log("Test interactions completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
