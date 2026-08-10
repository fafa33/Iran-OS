// SPDX-License-Identifier: MIT
// Recognized Reserve Backing Runtime Model — minimal identity storage tests.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecognizedReserveBacking", function () {
  let sovereign, court, oracle, feeder, recognizer, council1, parliament, government, auditor;
  let recipient, stranger;
  let registry, swf, treasury, token, kernel, api3Oracle;

  const Class = {
    Unset: 0,
    RecognizedReserveBacking: 1,
    TreasuryInventory: 2,
    SovereignWealthFundAsset: 3,
    BudgetAllocation: 4,
    SpeculativeAsset: 5,
    OracleReportedData: 6,
    SovereignMonetaryReserve: 7,
    ExplicitlyApprovedMonetaryReserve: 8,
    AccountingRecord: 9,
    Report: 10,
    EventRecord: 11,
    TemporaryHolding: 12,
    ReclaimedAsset: 13,
  };

  const value = ethers.parseUnits("1000000", 18);

  beforeEach(async function () {
    [
      sovereign,
      court,
      oracle,
      feeder,
      recognizer,
      council1,
      parliament,
      government,
      auditor,
      recipient,
      stranger,
    ] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("RecognizedReserveBacking");
    registry = await Registry.deploy(sovereign.address, recognizer.address);
    await registry.waitForDeployment();

    const Kernel = await ethers.getContractFactory("IranOS_Kernel");
    kernel = await Kernel.deploy(
      sovereign.address,
      court.address,
      oracle.address,
      sovereign.address
    );
    await kernel.waitForDeployment();

    const SWF = await ethers.getContractFactory("SovereignWealthFund");
    swf = await SWF.deploy(sovereign.address, await kernel.getAddress());
    await swf.waitForDeployment();
    await swf.connect(sovereign).grantRole(await swf.COUNCIL_ROLE(), council1.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(sovereign.address, await kernel.getAddress());
    await treasury.waitForDeployment();
    await treasury.connect(sovereign).grantRole(await treasury.PARLIAMENT_ROLE(), parliament.address);
    await treasury.connect(sovereign).grantRole(await treasury.GOVERNMENT_ROLE(), government.address);
    await treasury.connect(sovereign).grantRole(await treasury.AUDITOR_ROLE(), auditor.address);

    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    token = await PahlaviToken.deploy(sovereign.address, await kernel.getAddress(), 0n);
    await token.waitForDeployment();
    await kernel.connect(sovereign).setPahlaviToken(await token.getAddress());

    const API3Oracle = await ethers.getContractFactory("API3Oracle");
    api3Oracle = await API3Oracle.deploy(await kernel.getAddress(), [feeder.address]);
    await api3Oracle.waitForDeployment();
    await kernel.connect(sovereign).grantOfficialAccess(
      await api3Oracle.getAddress(),
      await kernel.ORACLE_ROLE()
    );
  });

  it("records recognized reserve backing as an explicit deterministic identity", async function () {
    const sourceId = ethers.id("recognized-reserve:swf-l1:1");
    const identityId = await registry.deriveIdentityId(await swf.getAddress(), sourceId);

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        await swf.getAddress(),
        sourceId,
        "recognized reserve evidence"
      )
    ).to.emit(registry, "BackingIdentityRecorded")
      .withArgs(
        identityId,
        Class.RecognizedReserveBacking,
        value,
        await swf.getAddress(),
        sourceId,
        recognizer.address,
        "recognized reserve evidence"
      );

    const identity = await registry.identities(identityId);
    expect(identity.exists).to.be.true;
    expect(identity.backingClass).to.equal(Class.RecognizedReserveBacking);
    expect(identity.value).to.equal(value);
    expect(identity.sourceContract).to.equal(await swf.getAddress());
    expect(identity.sourceId).to.equal(sourceId);
    expect(identity.recordedBy).to.equal(recognizer.address);
    expect(await registry.isRecognizedBacking(identityId)).to.be.true;
    expect(await registry.recognizedBackingValue(identityId)).to.equal(value);
    expect(await registry.recognizedBackingTotal()).to.equal(value);
  });

  it("accepts only runtime-recognized monetary reserve classifications", async function () {
    const accepted = [
      [Class.RecognizedReserveBacking, "recognized-reserve-backing"],
      [Class.SovereignMonetaryReserve, "sovereign-monetary-reserve"],
      [Class.ExplicitlyApprovedMonetaryReserve, "explicitly-approved-monetary-reserve"],
    ];

    for (const [backingClass, label] of accepted) {
      const sourceId = ethers.id(label);
      const identityId = await registry.deriveIdentityId(await swf.getAddress(), sourceId);

      await registry.connect(recognizer).recordIdentity(
        backingClass,
        value,
        await swf.getAddress(),
        sourceId,
        `${label} evidence`
      );

      expect(await registry.isRecognizedBacking(identityId)).to.be.true;
      expect(await registry.recognizedBackingValue(identityId)).to.equal(value);
    }

    expect(await registry.recognizedBackingTotal()).to.equal(value * 3n);
  });

  it("rejects treasury inventory, SWF assets, budget allocations, speculative assets, and oracle reports", async function () {
    const entries = [
      [Class.TreasuryInventory, await treasury.getAddress(), ethers.id("treasury-inventory")],
      [Class.SovereignWealthFundAsset, await swf.getAddress(), ethers.id("swf-asset")],
      [Class.BudgetAllocation, await treasury.getAddress(), ethers.id("budget-allocation")],
      [Class.SpeculativeAsset, await swf.getAddress(), ethers.id("speculative-asset")],
      [Class.OracleReportedData, await api3Oracle.getAddress(), ethers.id("oracle-report")],
      [Class.AccountingRecord, await treasury.getAddress(), ethers.id("accounting-record")],
      [Class.Report, await treasury.getAddress(), ethers.id("report")],
      [Class.EventRecord, await api3Oracle.getAddress(), ethers.id("event-record")],
      [Class.TemporaryHolding, await swf.getAddress(), ethers.id("temporary-holding")],
      [Class.ReclaimedAsset, await swf.getAddress(), ethers.id("reclaimed-asset")],
    ];

    for (const [backingClass, sourceContract, sourceId] of entries) {
      const identityId = await registry.deriveIdentityId(sourceContract, sourceId);
      await expect(
        registry.connect(recognizer).recordIdentity(
          backingClass,
          value,
          sourceContract,
          sourceId,
          "non-recognized identity evidence"
        )
      ).to.be.revertedWith("RRB: class not recognized");

      expect((await registry.identities(identityId)).exists).to.be.false;
      expect(await registry.isRecognizedBacking(identityId)).to.be.false;
      expect(await registry.recognizedBackingValue(identityId)).to.equal(0n);
    }

    expect(await registry.recognizedBackingTotal()).to.equal(0n);
  });

  it("allows other classes only after explicit runtime policy recognition", async function () {
    const sourceId = ethers.id("explicit-policy-reclaimed-asset");
    const identityId = await registry.deriveIdentityId(await swf.getAddress(), sourceId);

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.ReclaimedAsset,
        value,
        await swf.getAddress(),
        sourceId,
        "reclaimed asset before policy"
      )
    ).to.be.revertedWith("RRB: class not recognized");

    await expect(
      registry.connect(stranger).setRecognizedClassPolicy(Class.ReclaimedAsset, true)
    ).to.be.reverted;

    await expect(
      registry.connect(sovereign).setRecognizedClassPolicy(Class.ReclaimedAsset, false)
    ).to.be.revertedWith("RRB: cannot disable class");

    await expect(
      registry.connect(sovereign).setRecognizedClassPolicy(Class.ReclaimedAsset, true)
    ).to.emit(registry, "RecognizedClassPolicyUpdated")
      .withArgs(Class.ReclaimedAsset, true, sovereign.address);

    await registry.connect(recognizer).recordIdentity(
      Class.ReclaimedAsset,
      value,
      await swf.getAddress(),
      sourceId,
      "explicit runtime policy evidence"
    );

    expect(await registry.isRecognizedBacking(identityId)).to.be.true;
    expect(await registry.recognizedBackingValue(identityId)).to.equal(value);
    expect(await registry.recognizedBackingTotal()).to.equal(value);
  });

  it("keeps recognized-backing identity separate from SWF, Treasury, API3, and PahlaviToken runtime accounting", async function () {
    await swf.connect(council1).depositToL1(value, "SWF accounting only");
    await treasury.connect(parliament).createBudgetLine(0, value);
    await treasury.connect(government).proposeTransaction(
      recipient.address,
      ethers.parseUnits("100", 18),
      1,
      "Treasury accounting only"
    );
    await api3Oracle.connect(feeder).syncReserves(value);

    expect((await swf.layerL1()).balance).to.equal(value);
    expect(await treasury.totalBudgetAllocated()).to.equal(value);
    expect(await treasury.txCount()).to.equal(1n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await registry.recognizedBackingTotal()).to.equal(0n);

    await registry.connect(recognizer).recordIdentity(
      Class.RecognizedReserveBacking,
      value,
      await swf.getAddress(),
      ethers.id("explicit-recognition-after-accounting"),
      "explicit recognized backing evidence"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(value);
    expect((await swf.layerL1()).balance).to.equal(value);
    expect(await treasury.totalBudgetAllocated()).to.equal(value);
    expect(await treasury.txCount()).to.equal(1n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
  });

  it("does not change PahlaviToken mint capacity when recognized backing is recorded", async function () {
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(ethers.parseUnits("1", 18))).to.be.false;

    await registry.connect(recognizer).recordIdentity(
      Class.RecognizedReserveBacking,
      value,
      await swf.getAddress(),
      ethers.id("recognized-but-not-token-reserves"),
      "recognized backing identity does not update token reserves"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(value);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(ethers.parseUnits("1", 18))).to.be.false;
    await expect(
      token.connect(sovereign).mint(recipient.address, ethers.parseUnits("1", 18), "no reserve sync")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("keeps unauthorized, duplicate, unset, zero-value, and invalid-source paths state-neutral", async function () {
    const sourceId = ethers.id("neutrality-source");
    const sourceContract = await swf.getAddress();
    const identityId = await registry.deriveIdentityId(sourceContract, sourceId);

    await expect(
      registry.connect(stranger).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        sourceContract,
        sourceId,
        "unauthorized evidence"
      )
    ).to.be.reverted;

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.Unset,
        value,
        sourceContract,
        sourceId,
        "unset evidence"
      )
    ).to.be.revertedWith("RRB: unset class");

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        0n,
        sourceContract,
        sourceId,
        "zero evidence"
      )
    ).to.be.revertedWith("RRB: zero value");

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        ethers.ZeroAddress,
        sourceId,
        "invalid source evidence"
      )
    ).to.be.revertedWith("RRB: invalid source");

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        sourceContract,
        ethers.ZeroHash,
        "invalid source id evidence"
      )
    ).to.be.revertedWith("RRB: invalid source id");

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        sourceContract,
        sourceId,
        ""
      )
    ).to.be.revertedWith("RRB: evidence required");

    expect((await registry.identities(identityId)).exists).to.be.false;
    expect(await registry.recognizedBackingTotal()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await swf.totalAssets()).to.equal(0n);
    expect(await treasury.totalBudgetAllocated()).to.equal(0n);

    await registry.connect(recognizer).recordIdentity(
      Class.RecognizedReserveBacking,
      value,
      sourceContract,
      sourceId,
      "valid evidence"
    );
    expect(await registry.recognizedBackingTotal()).to.equal(value);

    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        value,
        sourceContract,
        sourceId,
        "duplicate evidence"
      )
    ).to.be.revertedWith("RRB: identity exists");

    expect(await registry.recognizedBackingTotal()).to.equal(value);
    expect((await registry.identities(identityId)).value).to.equal(value);
  });
});
