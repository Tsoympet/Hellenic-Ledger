const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CitizenID", function () {
  let citizenID;
  let deployer, user1;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();

    const CitizenID = await ethers.getContractFactory("CitizenID");
    citizenID = await upgrades.deployProxy(CitizenID, [deployer.address], { initializer: "initialize" });
    await citizenID.waitForDeployment();
  });

  it("should verify a user", async function () {
    await citizenID.verifyUser(user1.address);
    expect(await citizenID.isVerified(user1.address)).to.be.true;
  });

  it("should revoke verification", async function () {
    await citizenID.verifyUser(user1.address);
    await citizenID.revokeVerification(user1.address);
    expect(await citizenID.isVerified(user1.address)).to.be.false;
  });

  it("should restrict verification to owner", async function () {
    await expect(citizenID.connect(user1).verifyUser(user1.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
