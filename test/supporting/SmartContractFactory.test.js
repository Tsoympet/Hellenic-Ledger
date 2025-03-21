const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("SmartContractFactory", function () {
  let smartContractFactory, obolos;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const Obolos = await ethers.getContractFactory("Obolos");
    const SmartContractFactory = await ethers.getContractFactory("SmartContractFactory");

    obolos = await upgrades.deployProxy(Obolos, [ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await obolos.waitForDeployment();

    smartContractFactory = await upgrades.deployProxy(SmartContractFactory, [obolos.target], { initializer: "initialize" });
    await smartContractFactory.waitForDeployment();
  });

  it("should deploy a contract", async function () {
    await obolos.transfer(user1.address, ethers.parseEther("100"));
    await obolos.connect(user1).approve(smartContractFactory.target, ethers.parseEther("100"));
    const newContract = await smartContractFactory.deployContract(user1.address);
    expect(newContract).to.not.equal(ethers.ZeroAddress);
  });
});
