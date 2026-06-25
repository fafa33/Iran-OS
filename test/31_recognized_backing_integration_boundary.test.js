// SPDX-License-Identifier: MIT
// Recognized backing integration boundary characterization.
//
// These tests define safety expectations before recognizedBackingTotal is wired
// into PahlaviToken reserve or mint accounting. They are intentionally tests
// only: no mint-capacity behavior change, no breach remediation, and no
// production-readiness claim.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Recognized Backing Integration Boundary", function () {
  let sovereign, court, oracle, feeder, recognizer, swfMinter, council1;
  let parliament, government, recipient, stranger;
  let registry, swf, treasury, token, kernel, api3Oracle;

  const Class = {
    Unset: 0,
    RecognizedReserveBacking: 1,
    TreasuryInventory: 2,
    SovereignWealthFundAsset: 3,
    BudgetAllocation: 4,
    SpeculativeAsset: 5,
    OracleReportedData: 6,
  };

  const backingValue = ethers.parseUnits("1000000", 18);
  const mintAmount = ethers.parseUnits("100", 18);

  async function recordIdentity(backingClass, sourceContract, sourceLabel, amount = backingValue) {
    return registry.connect(recognizer).recordIdentity(
      backingClass,
      amount,
      sourceContract,
      ethers.id(sourceLabel),
      `${sourceLabel} evidence`
    );
  }

  beforeEach(async function () {
    [
      sovereign,
      court,
      oracle,
      feeder,
      recognizer,
      swfMinter,
      council1,
      parliament,
      government,
      recipient,
      stranger,
    ] = await ethers.getSigners();

    const Kernel = await ethers.getContractFactory("IranOS_Kernel");
    kernel = await Kernel.deploy(
      sovereign.address,
      court.address,
      oracle.address,
      swfMinter.address
    );
    await kernel.waitForDeployment();

    const SWF = await ethers.getContractFactory("SovereignWealthFund");
    swf = await SWF.deploy(sovereign.address, await kernel.getAddress());
    await swf.waitForDeployment();
    await swf.connect(sovereign).grantRole(await swf.COUNCIL_ROLE(), council1.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(sovereign.address);
    await treasury.waitForDeployment();
    await treasury.connect(sovereign).grantRole(await treasury.PARLIAMENT_ROLE(), parliament.address);
    await treasury.connect(sovereign).grantRole(await treasury.GOVERNMENT_ROLE(), government.address);

    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    token = await PahlaviToken.deploy(swfMinter.address, await kernel.getAddress(), 0n);
    await token.waitForDeployment();
    await kernel.connect(sovereign).setPahlaviToken(await token.getAddress());

    const API3Oracle = await ethers.getContractFactory("API3Oracle");
    api3Oracle = await API3Oracle.deploy(await kernel.getAddress(), [feeder.address]);
    await api3Oracle.waitForDeployment();
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    await kernel.connect(sovereign).grantOfficialAccess(await api3Oracle.getAddress(), ORACLE_ROLE);
    await kernel.connect(sovereign).revokeRole(ORACLE_ROLE, oracle.address);

    const Registry = await ethers.getContractFactory("RecognizedReserveBacking");
    registry = await Registry.deploy(sovereign.address, recognizer.address);
    await registry.waitForDeployment();
  });

  it("recognizedBackingTotal is not automatically equivalent to PahlaviToken.totalReserves", async function () {
    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "integration-recognized-backing"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
    await expect(
      token.connect(swfMinter).mint(recipient.address, mintAmount, "recognized total is not token reserves")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("PahlaviToken mint capacity still depends only on token reserve accounting", async function () {
    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "recognized-before-token-sync",
      ethers.parseUnits("1", 18)
    );
    expect(await registry.recognizedBackingTotal()).to.equal(ethers.parseUnits("1", 18));
    expect(await token.canMint(mintAmount)).to.be.false;

    await api3Oracle.connect(feeder).syncReserves(backingValue);
    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;

    await expect(
      token.connect(swfMinter).mint(recipient.address, mintAmount, "token reserve accounting only")
    ).to.emit(token, "PahlaviMinted");
    expect(await token.totalSupply()).to.equal(mintAmount);
  });

  it("RecognizedReserveBacking cannot mint tokens or expand capacity by itself", async function () {
    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "registry-no-mint-authority"
    );

    const minterRole = await token.MINTER_ROLE();
    expect(await token.hasRole(minterRole, await registry.getAddress())).to.be.false;
    expect(await token.hasRole(minterRole, recognizer.address)).to.be.false;
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);

    await expect(
      token.connect(recognizer).mint(recipient.address, mintAmount, "recognizer cannot mint")
    ).to.be.reverted;
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("SWF, Treasury, and API3 surfaces cannot bypass explicit recognized-backing identity", async function () {
    await swf.connect(council1).depositToL1(backingValue, "SWF accounting surface");
    await treasury.connect(parliament).createBudgetLine(0, backingValue);
    await treasury.connect(government).proposeTransaction(
      recipient.address,
      mintAmount,
      1,
      "Treasury accounting surface"
    );
    await api3Oracle.connect(feeder).syncReserves(backingValue);

    expect((await swf.layerL1()).balance).to.equal(backingValue);
    expect(await treasury.totalBudgetAllocated()).to.equal(backingValue);
    expect(await treasury.txCount()).to.equal(1n);
    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await registry.recognizedBackingTotal()).to.equal(0n);

    await recordIdentity(
      Class.SovereignWealthFundAsset,
      await swf.getAddress(),
      "swf-asset-non-recognized"
    );
    await recordIdentity(
      Class.BudgetAllocation,
      await treasury.getAddress(),
      "budget-allocation-non-recognized"
    );
    await recordIdentity(
      Class.OracleReportedData,
      await api3Oracle.getAddress(),
      "oracle-report-non-recognized"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;
  });

  it("duplicate recognized identities do not create double-counted backing expectations", async function () {
    const sourceId = ethers.id("duplicate-recognized-source");
    const sourceContract = await swf.getAddress();
    const identityId = await registry.deriveIdentityId(sourceContract, sourceId);

    await registry.connect(recognizer).recordIdentity(
      Class.RecognizedReserveBacking,
      backingValue,
      sourceContract,
      sourceId,
      "first recognized identity evidence"
    );
    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await registry.recognizedBackingValue(identityId)).to.equal(backingValue);

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        backingValue,
        sourceContract,
        sourceId,
        "duplicate recognized identity evidence"
      )
    ).to.be.revertedWith("RRB: identity exists");

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("unrecognized and speculative identities do not affect token reserve floor", async function () {
    await recordIdentity(
      Class.SpeculativeAsset,
      await swf.getAddress(),
      "speculative-integration-boundary"
    );
    await recordIdentity(
      Class.TreasuryInventory,
      await treasury.getAddress(),
      "treasury-inventory-integration-boundary"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.currentReserveRatio()).to.equal(1000n);
    expect(await token.canMint(mintAmount)).to.be.false;
    await expect(
      token.connect(swfMinter).mint(recipient.address, mintAmount, "unrecognized identities are not floor backing")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("future integration must be explicit, not implicit", async function () {
    const tokenFunctions = token.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);
    const registryFunctions = registry.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);

    expect(registryFunctions).to.include("recognizedBackingTotal");
    expect(registryFunctions).to.include("recordIdentity");
    expect(tokenFunctions).to.include("totalReserves");
    expect(tokenFunctions).to.include("updateReserves");
    expect(tokenFunctions).to.not.include("recognizedBackingTotal");
    expect(tokenFunctions).to.not.include("setRecognizedReserveBacking");

    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "future-explicit-integration-boundary"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
  });
});
