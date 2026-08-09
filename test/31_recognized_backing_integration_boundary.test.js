// SPDX-License-Identifier: MIT
// Recognized backing integration boundary characterization.

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
    SovereignMonetaryReserve: 7,
    ExplicitlyApprovedMonetaryReserve: 8,
    AccountingRecord: 9,
    Report: 10,
    EventRecord: 11,
    TemporaryHolding: 12,
    ReclaimedAsset: 13,
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

  async function linkRecognizedBacking() {
    await expect(
      kernel.connect(sovereign).setPahlaviRecognizedReserveBacking(await registry.getAddress())
    ).to.emit(kernel, "RecognizedReserveBackingLinked");
    expect(await token.recognizedReserveBacking()).to.equal(await registry.getAddress());
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
    treasury = await Treasury.deploy(sovereign.address, await kernel.getAddress());
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

  it("recognizedBackingTotal reaches token reserve accounting only through explicit wiring and sync", async function () {
    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "integration-recognized-backing"
    );

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;

    await linkRecognizedBacking();
    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;

    await expect(kernel.connect(sovereign).syncRecognizedBackingTotal())
      .to.emit(kernel, "RecognizedReserveBackingSynced")
      .and.to.emit(token, "ReservesUpdated");

    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;
    await expect(
      token.connect(swfMinter).mint(recipient.address, mintAmount, "explicit recognized backing")
    ).to.emit(token, "PahlaviMinted");
  });

  it("Kernel.syncReserves before recognized backing activation does not change token reserves", async function () {
    const oracleValue = ethers.parseUnits("5000000", 18);
    await kernel.connect(sovereign).grantOfficialAccess(oracle.address, await kernel.ORACLE_ROLE());

    await expect(kernel.connect(oracle).syncReserves(oracleValue))
      .to.emit(kernel, "ReserveSynced")
      .and.to.emit(token, "ReservesUpdated");

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("PahlaviToken.updateReserves compatibility path does not mutate totalReserves", async function () {
    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const directToken = await PahlaviToken.deploy(swfMinter.address, oracle.address, 0n);
    await directToken.waitForDeployment();

    await expect(directToken.connect(oracle).updateReserves(backingValue))
      .to.emit(directToken, "ReservesUpdated");

    expect(await directToken.totalReserves()).to.equal(0n);
    expect(await directToken.canMint(mintAmount)).to.be.false;
  });

  it("explicit recognized monetary reserve classes sync through the existing replacement path", async function () {
    await recordIdentity(
      Class.SovereignMonetaryReserve,
      await swf.getAddress(),
      "sovereign-monetary-reserve-sync",
      backingValue
    );
    await recordIdentity(
      Class.ExplicitlyApprovedMonetaryReserve,
      await swf.getAddress(),
      "approved-monetary-reserve-sync",
      backingValue
    );

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue * 2n);
    expect(await token.totalReserves()).to.equal(0n);

    await linkRecognizedBacking();

    expect(await token.totalReserves()).to.equal(backingValue * 2n);
    expect(await token.canMint(mintAmount)).to.be.true;
  });

  it("activation atomically replaces token reserve accounting with recognizedBackingTotal", async function () {
    const staleOracleValue = ethers.parseUnits("5000000", 18);

    await api3Oracle.connect(feeder).syncReserves(staleOracleValue);
    expect(await token.totalReserves()).to.equal(0n);

    await recordIdentity(
      Class.RecognizedReserveBacking,
      await swf.getAddress(),
      "atomic-stale-replace"
    );
    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);

    await expect(
      kernel.connect(sovereign).setPahlaviRecognizedReserveBacking(await registry.getAddress())
    )
      .to.emit(kernel, "RecognizedReserveBackingLinked")
      .and.to.emit(kernel, "RecognizedReserveBackingSynced")
      .and.to.emit(token, "ReservesUpdated");

    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;
  });

  it("SWF, Treasury, and API3 surfaces do not become backing after recognized-backing wiring", async function () {
    await linkRecognizedBacking();

    await swf.connect(council1).depositToL1(backingValue, "SWF accounting surface");
    await treasury.connect(parliament).createBudgetLine(0, backingValue);
    await treasury.connect(government).proposeTransaction(
      recipient.address,
      mintAmount,
      1,
      "Treasury accounting surface"
    );

    expect((await swf.layerL1()).balance).to.equal(backingValue);
    expect(await treasury.totalBudgetAllocated()).to.equal(backingValue);
    expect(await treasury.txCount()).to.equal(1n);
    expect(await registry.recognizedBackingTotal()).to.equal(0n);

    await expect(
      api3Oracle.connect(feeder).syncReserves(backingValue)
    ).to.emit(api3Oracle, "ReserveSyncForwarded");

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
    await expect(
      token.connect(swfMinter).mint(recipient.address, mintAmount, "implicit surfaces blocked")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("non-recognized identities do not affect reserve floor or mint capacity", async function () {
    await linkRecognizedBacking();
    const rejected = [
      [Class.SpeculativeAsset, await swf.getAddress(), "speculative-integration-boundary"],
      [Class.TreasuryInventory, await treasury.getAddress(), "treasury-inventory-integration-boundary"],
      [Class.SovereignWealthFundAsset, await swf.getAddress(), "swf-asset-non-recognized"],
      [Class.BudgetAllocation, await treasury.getAddress(), "budget-allocation-non-recognized"],
      [Class.OracleReportedData, await api3Oracle.getAddress(), "oracle-report-non-recognized"],
    ];

    for (const [backingClass, sourceContract, sourceLabel] of rejected) {
      await expect(
        recordIdentity(backingClass, sourceContract, sourceLabel)
      ).to.be.revertedWith("RRB: class not recognized");
    }

    await kernel.connect(sovereign).syncRecognizedBackingTotal();

    expect(await registry.recognizedBackingTotal()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.currentReserveRatio()).to.equal(1000n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("treasury inventory, SWF assets, and oracle observations cannot be recognized by default", async function () {
    const rejected = [
      [Class.TreasuryInventory, await treasury.getAddress(), "treasury-inventory-runtime-reject"],
      [Class.SovereignWealthFundAsset, await swf.getAddress(), "swf-asset-runtime-reject"],
      [Class.OracleReportedData, await api3Oracle.getAddress(), "oracle-observation-runtime-reject"],
    ];

    for (const [backingClass, sourceContract, sourceLabel] of rejected) {
      await expect(
        recordIdentity(backingClass, sourceContract, sourceLabel)
      ).to.be.revertedWith("RRB: class not recognized");
    }

    await linkRecognizedBacking();
    expect(await registry.recognizedBackingTotal()).to.equal(0n);
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("duplicate recognized identities cannot increase token capacity twice", async function () {
    await linkRecognizedBacking();
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
    await expect(
      registry.connect(recognizer).recordIdentity(
        Class.RecognizedReserveBacking,
        backingValue,
        sourceContract,
        sourceId,
        "duplicate recognized identity evidence"
      )
    ).to.be.revertedWith("RRB: identity exists");

    await kernel.connect(sovereign).syncRecognizedBackingTotal();

    expect(await registry.recognizedBackingTotal()).to.equal(backingValue);
    expect(await registry.recognizedBackingValue(identityId)).to.equal(backingValue);
    expect(await token.totalReserves()).to.equal(backingValue);
    expect(await token.canMint(mintAmount)).to.be.true;
  });

  it("direct oracle sync cannot mint or expand capacity autonomously once recognized backing is active", async function () {
    await linkRecognizedBacking();
    const supplyBefore = await token.totalSupply();

    await expect(
      api3Oracle.connect(feeder).syncReserves(backingValue)
    ).to.emit(api3Oracle, "ReserveSyncForwarded");

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(supplyBefore);
    expect(await token.canMint(mintAmount)).to.be.false;
    expect(await token.hasRole(await token.MINTER_ROLE(), feeder.address)).to.be.false;
    expect(await token.hasRole(await token.MINTER_ROLE(), await api3Oracle.getAddress())).to.be.false;

    await expect(
      token.connect(feeder).mint(recipient.address, mintAmount, "feeder autonomous mint attempt")
    ).to.be.reverted;
    await expect(
      token.connect(stranger).mint(recipient.address, mintAmount, "stranger autonomous mint attempt")
    ).to.be.reverted;
    expect(await token.totalSupply()).to.equal(supplyBefore);
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

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;

    await expect(
      token.connect(recognizer).mint(recipient.address, mintAmount, "recognizer cannot mint")
    ).to.be.reverted;

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.canMint(mintAmount)).to.be.false;
  });

  it("token exposes the explicit recognized-backing integration surface", async function () {
    const tokenFunctions = token.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);

    expect(tokenFunctions).to.include("recognizedReserveBacking");
    expect(tokenFunctions).to.include("setRecognizedReserveBacking");
    expect(tokenFunctions).to.include("syncRecognizedBackingTotal");
    expect(tokenFunctions).to.include("totalReserves");
    expect(tokenFunctions).to.include("updateReserves");
  });
});
