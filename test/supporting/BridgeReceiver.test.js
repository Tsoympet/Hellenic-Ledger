const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("BridgeReceiver", function () {
  let bridgeReceiver, talanton;
  let deployer;

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();

    const Talanton = await ethers.getContractFactory("Talanton");
    const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");

    talanton = await upgrades.deployProxy(Talanton, [ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await talanton.waitForDeployment();

    bridgeReceiver = await upgrades.deployProxy(BridgeReceiver, [ethers.ZeroAddress, talanton.target, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await bridgeReceiver.waitForDeployment();
  });

  it("should mint tokens on bridge receive", async function () {
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(["address", "address", "uint256"], [talanton.target, deployer.address, ethers.parseEther("100")));
    await bridgeReceiver.lzReceive(1, "0x...", 1, payload);
    expect(await talanton.balanceOf(deployer.address)).to.equal(ethers.parseEther("100"));
  });
});
