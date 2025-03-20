const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const eponymousHeroes = ["0xYourAddress1", "0xYourAddress2", "0xYourAddress3", "0xYourAddress4"]; // Replace with actual addresses
  const layerZeroEndpoint = "0x6Fcb97553D41516Cb228ac03E9a8d093BD576638"; // BSC Testnet LayerZero endpoint
  const drachmaObolosLP = "0x..."; // Replace with PancakeSwap pair address
  const obolosTalantonLP = "0x..."; // Replace with PancakeSwap pair address

  // Deploy Contracts
  const HellenicPoliteia = await ethers.getContractFactory("HellenicPoliteia");
  const CitizenID = await ethers.getContractFactory("CitizenID");
  const Talanton = await ethers.getContractFactory("Talanton");
  const Drachma = await ethers.getContractFactory("Drachma");
  const Obolos = await ethers.getContractFactory("Obolos");
  const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
  const DisputeResolver = await ethers.getContractFactory("DisputeResolver");
  const LiquidityPoolManager = await ethers.getContractFactory("LiquidityPoolManager");
  const Oracle = await ethers.getContractFactory("Oracle");
  const PerksManager = await ethers.getContractFactory("PerksManager");
  const SmartContractFactory = await ethers.getContractFactory("SmartContractFactory");
  const TitanicNFT = await ethers.getContractFactory("TitanicNFT");
  const QuestNFT = await ethers.getContractFactory("QuestNFT");
  const RelicNFT = await ethers.getContractFactory("RelicNFT");

  // Deploy each contract
  const politeia = await upgrades.deployProxy(HellenicPoliteia, [ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, eponymousHeroes], { initializer: "initialize" });
  await politeia.waitForDeployment();

  const citizenID = await upgrades.deployProxy(CitizenID, [politeia.target], { initializer: "initialize" });
  await citizenID.waitForDeployment();

  const talanton = await upgrades.deployProxy(Talanton, [citizenID.target, ethers.ZeroAddress, politeia.target, layerZeroEndpoint, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
  await talanton.waitForDeployment();

  const drachma = await upgrades.deployProxy(Drachma, [citizenID.target, talanton.target, politeia.target, ethers.ZeroAddress, layerZeroEndpoint, drachmaObolosLP, ethers.ZeroAddress], { initializer: "initialize" });
  await drachma.waitForDeployment();

  const obolos = await upgrades.deployProxy(Obolos, [citizenID.target, talanton.target, drachma.target, politeia.target, ethers.ZeroAddress, layerZeroEndpoint, obolosTalantonLP, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
  await obolos.waitForDeployment();

  const oracle = await upgrades.deployProxy(Oracle, [], { initializer: "initialize" });
  await oracle.waitForDeployment();

  const titanicNFT = await upgrades.deployProxy(TitanicNFT, [talanton.target], { initializer: "initialize" });
  await titanicNFT.waitForDeployment();

  const disputeResolver = await upgrades.deployProxy(DisputeResolver, [talanton.target, citizenID.target, politeia.target], { initializer: "initialize" });
  await disputeResolver.waitForDeployment();

  const liquidityPoolManager = await upgrades.deployProxy(LiquidityPoolManager, [drachma.target, obolos.target, talanton.target, drachmaObolosLP, obolosTalantonLP], { initializer: "initialize" });
  await liquidityPoolManager.waitForDeployment();

  const questNFT = await upgrades.deployProxy(QuestNFT, [obolos.target, drachma.target], { initializer: "initialize" });
  await questNFT.waitForDeployment();

  const perksManager = await upgrades.deployProxy(PerksManager, [obolos.target], { initializer: "initialize" });
  await perksManager.waitForDeployment();

  const smartContractFactory = await upgrades.deployProxy(SmartContractFactory, [obolos.target], { initializer: "initialize" });
  await smartContractFactory.waitForDeployment();

  const relicNFT = await upgrades.deployProxy(RelicNFT, [obolos.target], { initializer: "initialize" });
  await relicNFT.waitForDeployment();

  const bridgeReceiver = await upgrades.deployProxy(BridgeReceiver, [layerZeroEndpoint, talanton.target, drachma.target, obolos.target], { initializer: "initialize" });
  await bridgeReceiver.waitForDeployment();

  // Update Politeia with contract addresses
  await politeia.initialize(citizenID.target, talanton.target, drachma.target, obolos.target, perksManager.target, eponymousHeroes);

  // Update other contracts with dependencies
  await talanton.initialize(citizenID.target, drachma.target, politeia.target, layerZeroEndpoint, titanicNFT.target, disputeResolver.target);
  await drachma.initialize(citizenID.target, talanton.target, politeia.target, oracle.target, layerZeroEndpoint, drachmaObolosLP, liquidityPoolManager.target);
  await obolos.initialize(citizenID.target, talanton.target, drachma.target, politeia.target, oracle.target, layerZeroEndpoint, obolosTalantonLP, questNFT.target, perksManager.target, smartContractFactory.target, relicNFT.target, liquidityPoolManager.target);

  console.log("Deployed Contracts:");
  console.log("HellenicPoliteia:", politeia.target);
  console.log("CitizenID:", citizenID.target);
  console.log("Talanton:", talanton.target);
  console.log("Drachma:", drachma.target);
  console.log("Obolos:", obolos.target);
  console.log("BridgeReceiver:", bridgeReceiver.target);
  console.log("DisputeResolver:", disputeResolver.target);
  console.log("LiquidityPoolManager:", liquidityPoolManager.target);
  console.log("Oracle:", oracle.target);
  console.log("PerksManager:", perksManager.target);
  console.log("SmartContractFactory:", smartContractFactory.target);
  console.log("TitanicNFT:", titanicNFT.target);
  console.log("QuestNFT:", questNFT.target);
  console.log("RelicNFT:", relicNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
