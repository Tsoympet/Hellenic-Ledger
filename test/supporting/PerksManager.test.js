const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("PerksManager", function () {
  let perksManager, obolos;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const Obolos = await ethers.getContractFactory("Obolos");
    const PerksManager = await ethers.getContractFactory("PerksManager");

    obolos = await upgrades.deployProxy(Obolos, [ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await obolos.waitForDeployment();

    perksManager = await upgrades.deployProxy(PerksManager, [obolos.target], { initializer: "initialize" });
    await perksManager.waitForDeployment();
  });

  it("should update voting boost", async function () {
    await perksManager.updateBoost(user1.address, ethers.parseEther("1000"));
    expect(await perksManager.getVotingBoost(user1.address)).to.equal(1); // 1000 / 1000 = 1 boost
  });
});
