require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.28",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: ["YOUR_PRIVATE_KEY"] // Replace with your deployer private key
    }
  }
};
{
  "name": "hellenic-sao-ledger",
  "version": "1.0.0",
  "description": "Hellenic Sao Ledger project",
  "scripts": {
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.js --network bscTestnet"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@openzeppelin/hardhat-upgrades": "^3.0.2",
    "hardhat": "^2.22.1"
  }
}
