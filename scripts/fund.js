const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding with:", deployer.address);

  const politeiaAddress = "0x..."; // Replace with deployed HellenicPoliteia address
  const talantonAddress = "0x..."; // Replace with deployed Talanton address
  const drachmaAddress = "0x..."; // Replace with deployed Drachma address
  const obolosAddress = "0x..."; // Replace with deployed Obolos address

  const Talanton = await ethers.getContractFactory("Talanton");
  const Drachma = await ethers.getContractFactory("Drachma");
  const Obolos = await ethers.getContractFactory("Obolos");

  const talanton = Talanton.attach(talantonAddress);
  const drachma = Drachma.attach(drachmaAddress);
  const obolos = Obolos.attach(obolosAddress);

  const talantonAmount = ethers.parseEther("50000"); // 50,000 Talanton
  const drachmaAmount = ethers.parseEther("500000000"); // 500M Drachma
  const obolosAmount = ethers.parseEther("2500000000"); // 2.5B Obolos

  // Fund Politeia
  await talanton.transfer(politeiaAddress, talantonAmount);
  await drachma.transfer(politeiaAddress, drachmaAmount);
  await obolos.transfer(politeiaAddress, obolosAmount);

  console.log("Funded HellenicPoliteia with:");
  console.log("Talanton:", ethers.formatEther(talantonAmount));
  console.log("Drachma:", ethers.formatEther(drachmaAmount));
  console.log("Obolos:", ethers.formatEther(obolosAmount));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
