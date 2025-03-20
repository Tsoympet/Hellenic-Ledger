const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Transferring ownership with:", deployer.address);

  const politeiaAddress = "0x..."; // Replace with deployed HellenicPoliteia address
  const contractAddresses = {
    talanton: "0x...",
    drachma: "0x...",
    obolos: "0x...",
    citizenID: "0x...",
    bridgeReceiver: "0x...",
    disputeResolver: "0x...",
    liquidityPoolManager: "0x...",
    oracle: "0x...",
    perksManager: "0x...",
    smartContractFactory: "0x...",
    titanicNFT: "0x...",
    questNFT: "0x...",
    relicNFT: "0x..."
  };

  for (const [name, address] of Object.entries(contractAddresses)) {
    const Contract = await ethers.getContractFactory(name === "citizenID" ? "CitizenID" : name === "bridgeReceiver" ? "BridgeReceiver" : name.charAt(0).toUpperCase() + name.slice(1));
    const contract = Contract.attach(address);
    await contract.transferOwnership(politeiaAddress);
    console.log(`Transferred ownership of ${name} to HellenicPoliteia:`, politeiaAddress);
  }

  console.log("Ownership transfer complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
