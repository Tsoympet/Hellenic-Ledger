const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("LiquidityPoolManager", function () {
  let liquidityPoolManager, drachma, obolos;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const Drachma = await ethers.getContractFactory("Drachma");
    const Obolos = await ethers.getContractFactory("Obolos");
    const LiquidityPoolManager = await ethers.getContractFactory("LiquidityPoolManager");

    drachma = await upgrades.deployProxy(Drachma, [ethers.ZeroAddress, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await drachma.waitForDeployment();

    obolos = await upgrades.deployProxy(Obolos, [ethers.ZeroAddress, ethers.ZeroAddress, drachma.target, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await obolos.waitForDeployment();

    liquidityPoolManager = await upgrades.deployProxy(LiquidityPoolManager, [drachma.target, obolos.target, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await liquidityPoolManager.waitForDeployment();
  });

  it("should add liquidity", async function () {
    await drachma.transfer(user1.address, ethers.parseEther("1000"));
    await obolos.transfer(user1.address, ethers.parseEther("1000"));
    await drachma.connect(user1).approve(liquidityPoolManager.target, ethers.parseEther("1000"));
    await obolos.connect(user1).approve(liquidityPoolManager.target, ethers.parseEther("1000"));
    await liquidityPoolManager.connect(user1).addLiquidity(drachma.target, obolos.target, ethers.parseEther("1000"), ethers.parseEther("1000"));
    expect(await drachma.balanceOf(liquidityPoolManager.target)).to.equal(ethers.parseEther("1000"));
  });
});
