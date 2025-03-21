const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Oracle", function () {
  let oracle;
  let deployer;

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("Oracle");
    oracle = await upgrades.deployProxy(Oracle, [], { initializer: "initialize" });
    await oracle.waitForDeployment();
  });

  it("should update and retrieve price", async function () {
    await oracle.updatePrice(deployer.address, 100);
    expect(await oracle.getPrice(deployer.address)).to.equal(100);
  });
});
