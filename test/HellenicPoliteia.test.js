const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HellenicPoliteia", function () {
  let politeia, talanton, drachma, obolos, citizenID, perksManager;
  let deployer, hero1, hero2, hero3, hero4, user1;

  beforeEach(async function () {
    [deployer, hero1, hero2, hero3, hero4, user1] = await ethers.getSigners();
    const eponymousHeroes = [hero1.address, hero2.address, hero3.address, hero4.address];

    const CitizenID = await ethers.getContractFactory("CitizenID");
    const Talanton = await ethers.getContractFactory("Talanton");
    const Drachma = await ethers.getContractFactory("Drachma");
    const Obolos = await ethers.getContractFactory("Obolos");
    const PerksManager = await ethers.getContractFactory("PerksManager");
    const HellenicPoliteia = await ethers.getContractFactory("HellenicPoliteia");

    citizenID = await upgrades.deployProxy(CitizenID, [deployer.address], { initializer: "initialize" });
    await citizenID.waitForDeployment();

    talanton = await upgrades.deployProxy(Talanton, [citizenID.target, ethers.ZeroAddress, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await talanton.waitForDeployment();

    drachma = await upgrades.deployProxy(Drachma, [citizenID.target, talanton.target, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await drachma.waitForDeployment();

    obolos = await upgrades.deployProxy(Obolos, [citizenID.target, talanton.target, drachma.target, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress], { initializer: "initialize" });
    await obolos.waitForDeployment();

    perksManager = await upgrades.deployProxy(PerksManager, [obolos.target], { initializer: "initialize" });
    await perksManager.waitForDeployment();

    politeia = await upgrades.deployProxy(HellenicPoliteia, [citizenID.target, talanton.target, drachma.target, obolos.target, perksManager.target, eponymousHeroes], { initializer: "initialize" });
    await politeia.waitForDeployment();

    await talanton.transferOwnership(politeia.target);
    await drachma.transferOwnership(politeia.target);
    await obolos.transferOwnership(politeia.target);
    await citizenID.transferOwnership(politeia.target);
    await perksManager.transferOwnership(politeia.target);
  });

  it("should allow voting on an election", async function () {
    await citizenID.verifyUser(user1.address);
    await politeia.connect(user1).startElection("Strategos", user1.address);
    await politeia.connect(user1).voteForRole("Strategos", 0);
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // Advance 7 days
    await ethers.provider.send("evm_mine", []);
    await politeia.finalizeElections("Strategos");
    expect(await politeia.strategoi(0)).to.equal(user1.address);
  });

  it("should distribute revenue to roles", async function () {
    await talanton.transfer(politeia.target, ethers.parseEther("100000"));
    await drachma.transfer(politeia.target, ethers.parseEther("1000000000"));
    await obolos.transfer(politeia.target, ethers.parseEther("5000000000"));
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Advance 30 days
    await ethers.provider.send("evm_mine", []);
    const heroBalanceBefore = await talanton.balanceOf(hero1.address);
    await politeia.distributeRevenue(0, 500);
    const heroBalanceAfter = await talanton.balanceOf(hero1.address);
    expect(heroBalanceAfter).to.be.above(heroBalanceBefore);
  });

  it("should allow Archon to veto a motion", async function () {
    await citizenID.verifyUser(user1.address);
    await politeia.connect(user1).proposeSilverMotion("Test Motion", 5, 10, "0x");
    await politeia.connect(deployer).startElection("Archon", deployer.address);
    await politeia.connect(deployer).voteForRole("Archon", 0);
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await politeia.finalizeElections("Archon");
    await politeia.connect(deployer).vetoSilverMotion(0);
    expect((await politeia.silverMotions(0)).vetoedByArchon).to.be.true;
  });
});
