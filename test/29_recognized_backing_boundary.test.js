// SPDX-License-Identifier: MIT
// Recognized Reserve Backing Runtime Model — boundary characterization.
//
// These tests lock the current economic boundary before recognized-backing
// storage or reserve-classification runtime logic is introduced. They are
// intentionally characterization-only: no new reserve contract, no new backing
// identity, no oracle-to-token expansion beyond the merged sync path.

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Recognized Reserve Backing Boundary Characterization", function () {
  let sovereign, court, oracle, feeder, swfMinter, council1, council2, council3;
  let parliament, government, auditor1, auditor2, recipient, stranger;
  let token, swf, treasury, kernel, api3Oracle;

  const ZERO_RESERVES = 0n;
  const MINT_AMOUNT = ethers.parseUnits("100", 18);

  async function deployToken(initialReserves = ZERO_RESERVES) {
    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const deployed = await PahlaviToken.deploy(
      swfMinter.address,
      kernel ? await kernel.getAddress() : oracle.address,
      initialReserves
    );
    await deployed.waitForDeployment();
    return deployed;
  }

  async function expectMonetaryState(token_, snapshot) {
    expect(await token_.totalSupply()).to.equal(snapshot.supply);
    expect(await token_.totalReserves()).to.equal(snapshot.reserves);
    expect(await token_.balanceOf(recipient.address)).to.equal(snapshot.recipientBalance);
    expect(await token_.balanceOf(stranger.address)).to.equal(snapshot.strangerBalance);
  }

  async function tokenSnapshot(token_) {
    return {
      supply: await token_.totalSupply(),
      reserves: await token_.totalReserves(),
      recipientBalance: await token_.balanceOf(recipient.address),
      strangerBalance: await token_.balanceOf(stranger.address),
    };
  }

  async function swfSnapshot() {
    return {
      l1: await swf.layerL1(),
      l2: await swf.layerL2(),
      l3: await swf.layerL3(),
      totalAssets: await swf.totalAssets(),
      txCount: await swf.txCount(),
    };
  }

  async function expectSwfSnapshotUnchanged(snapshot) {
    const l1 = await swf.layerL1();
    const l2 = await swf.layerL2();
    const l3 = await swf.layerL3();
    expect(l1.balance).to.equal(snapshot.l1.balance);
    expect(l1.totalDeposited).to.equal(snapshot.l1.totalDeposited);
    expect(l1.totalWithdrawn).to.equal(snapshot.l1.totalWithdrawn);
    expect(l2.balance).to.equal(snapshot.l2.balance);
    expect(l2.totalDeposited).to.equal(snapshot.l2.totalDeposited);
    expect(l2.totalWithdrawn).to.equal(snapshot.l2.totalWithdrawn);
    expect(l3.balance).to.equal(snapshot.l3.balance);
    expect(l3.totalDeposited).to.equal(snapshot.l3.totalDeposited);
    expect(l3.totalWithdrawn).to.equal(snapshot.l3.totalWithdrawn);
    expect(await swf.totalAssets()).to.equal(snapshot.totalAssets);
    expect(await swf.txCount()).to.equal(snapshot.txCount);
  }

  async function treasurySnapshot() {
    return {
      currentFiscalYear: await treasury.currentFiscalYear(),
      totalBudgetAllocated: await treasury.totalBudgetAllocated(),
      txCount: await treasury.txCount(),
      budgetLineCount: await treasury.budgetLineCount(),
    };
  }

  async function expectTreasurySnapshotUnchanged(snapshot) {
    expect(await treasury.currentFiscalYear()).to.equal(snapshot.currentFiscalYear);
    expect(await treasury.totalBudgetAllocated()).to.equal(snapshot.totalBudgetAllocated);
    expect(await treasury.txCount()).to.equal(snapshot.txCount);
    expect(await treasury.budgetLineCount()).to.equal(snapshot.budgetLineCount);
  }

  beforeEach(async function () {
    [
      sovereign,
      court,
      oracle,
      feeder,
      swfMinter,
      council1,
      council2,
      council3,
      parliament,
      government,
      auditor1,
      auditor2,
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
    const COUNCIL_ROLE = await swf.COUNCIL_ROLE();
    await swf.connect(sovereign).grantRole(COUNCIL_ROLE, council1.address);
    await swf.connect(sovereign).grantRole(COUNCIL_ROLE, council2.address);
    await swf.connect(sovereign).grantRole(COUNCIL_ROLE, council3.address);

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(sovereign.address);
    await treasury.waitForDeployment();
    await treasury.connect(sovereign).grantRole(await treasury.PARLIAMENT_ROLE(), parliament.address);
    await treasury.connect(sovereign).grantRole(await treasury.GOVERNMENT_ROLE(), government.address);
    await treasury.connect(sovereign).grantRole(await treasury.AUDITOR_ROLE(), auditor1.address);
    await treasury.connect(sovereign).grantRole(await treasury.AUDITOR_ROLE(), auditor2.address);

    token = await deployToken(ZERO_RESERVES);

    const API3Oracle = await ethers.getContractFactory("API3Oracle");
    api3Oracle = await API3Oracle.deploy(await kernel.getAddress(), [feeder.address]);
    await api3Oracle.waitForDeployment();
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    await kernel.connect(sovereign).grantOfficialAccess(
      await api3Oracle.getAddress(),
      ORACLE_ROLE
    );
    await kernel.connect(sovereign).revokeRole(ORACLE_ROLE, oracle.address);
    await kernel.connect(sovereign).setPahlaviToken(await token.getAddress());
  });

  it("SWF deposits, withdrawals, and layer accounting do not automatically increase PahlaviToken mint capacity", async function () {
    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(MINT_AMOUNT)).to.be.false;

    const depositAmount = ethers.parseUnits("1000000", 18);
    await swf.connect(council1).depositToL1(depositAmount, "recognized-backing boundary L1");
    await swf.connect(council1).depositToL2(depositAmount, "recognized-backing boundary L2");
    await swf.connect(council1).depositToL3(depositAmount, "recognized-backing boundary L3");

    const l1 = await swf.layerL1();
    const l2 = await swf.layerL2();
    const l3 = await swf.layerL3();
    expect(l1.balance).to.equal(depositAmount);
    expect(l2.balance).to.equal(depositAmount);
    expect(l3.balance).to.equal(depositAmount);
    expect(await swf.totalAssets()).to.equal(depositAmount * 3n);

    await swf.connect(council1).proposeWithdrawal(1, ethers.parseUnits("1000", 18), "boundary withdrawal");
    await swf.connect(council2).signWithdrawal(1n);
    await swf.connect(council3).signWithdrawal(1n);
    await swf.connect(council1).distributeAnnualYield();

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.canMint(MINT_AMOUNT)).to.be.false;
    await expect(
      token.connect(swfMinter).mint(recipient.address, MINT_AMOUNT, "SWF accounting is not backing")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("Treasury budget lines, proposals, execution, and rejection do not become PahlaviToken reserve backing", async function () {
    const budgetAmount = ethers.parseUnits("1000000000", 18);
    const spendAmount = ethers.parseUnits("1000000", 18);

    await treasury.connect(parliament).createBudgetLine(0, budgetAmount);
    await treasury.connect(government).proposeTransaction(
      recipient.address,
      spendAmount,
      1,
      "recognized-backing boundary spend"
    );
    await treasury.connect(auditor1).signTransaction(1n);
    await treasury.connect(auditor2).signTransaction(1n);

    const line = await treasury.getBudgetLine(1);
    const tx_ = await treasury.getTransaction(1);
    expect(line.spent).to.equal(spendAmount);
    expect(tx_.executed).to.be.true;

    await treasury.connect(government).proposeTransaction(
      recipient.address,
      spendAmount,
      1,
      "recognized-backing rejected spend"
    );
    await treasury.connect(sovereign).rejectTransaction(2n, "boundary rejection");
    expect((await treasury.getTransaction(2n)).rejected).to.be.true;

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.canMint(MINT_AMOUNT)).to.be.false;
    await expect(
      token.connect(swfMinter).mint(recipient.address, MINT_AMOUNT, "Treasury accounting is not backing")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
  });

  it("API3 reserve reports forward data but do not become monetary backing", async function () {
    const newReserves = ethers.parseUnits("1000000", 18);
    const supplyBefore = await token.totalSupply();
    const swfMinterRole = await token.MINTER_ROLE();

    expect(await token.hasRole(swfMinterRole, feeder.address)).to.be.false;
    expect(await token.hasRole(swfMinterRole, await api3Oracle.getAddress())).to.be.false;
    expect(await kernel.hasRole(await kernel.ORACLE_ROLE(), await api3Oracle.getAddress())).to.be.true;
    expect(await kernel.hasRole(await kernel.ORACLE_ROLE(), oracle.address)).to.be.false;

    await expect(
      kernel.connect(oracle).syncReserves(newReserves)
    ).to.be.revertedWith("Kernel: caller is not an Oracle");
    expect(await token.totalReserves()).to.equal(0n);

    await expect(api3Oracle.connect(feeder).syncReserves(newReserves))
      .to.emit(api3Oracle, "ReserveSyncForwarded")
      .and.to.emit(kernel, "ReserveSynced")
      .and.to.emit(token, "ReservesUpdated");

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(supplyBefore);
    expect(await token.hasRole(swfMinterRole, feeder.address)).to.be.false;
    expect(await token.hasRole(swfMinterRole, await api3Oracle.getAddress())).to.be.false;

    await expect(
      token.connect(feeder).mint(recipient.address, MINT_AMOUNT, "feeder autonomous mint attempt")
    ).to.be.reverted;
    await expect(
      token.connect(stranger).mint(recipient.address, MINT_AMOUNT, "stranger autonomous mint attempt")
    ).to.be.reverted;

    expect(await token.totalSupply()).to.equal(supplyBefore);
    expect(await token.balanceOf(recipient.address)).to.equal(0n);

    await expect(
      token.connect(swfMinter).mint(recipient.address, MINT_AMOUNT, "oracle report is not backing")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
    expect(await token.totalSupply()).to.equal(supplyBefore);
  });

  it("failed and unauthorized paths do not mutate token reserves or SWF/Treasury accounting state", async function () {
    const monetaryBefore = await tokenSnapshot(token);
    const swfBefore = await swfSnapshot();
    const treasuryBefore = await treasurySnapshot();

    await expect(
      swf.connect(stranger).depositToL1(ethers.parseUnits("1", 18), "unauthorized SWF deposit")
    ).to.be.reverted;
    await expect(
      swf.connect(stranger).proposeWithdrawal(1, ethers.parseUnits("1", 18), "unauthorized SWF withdrawal")
    ).to.be.reverted;
    await expect(
      treasury.connect(stranger).createBudgetLine(0, ethers.parseUnits("1", 18))
    ).to.be.reverted;
    await expect(
      treasury.connect(stranger).proposeTransaction(recipient.address, ethers.parseUnits("1", 18), 1, "unauthorized")
    ).to.be.reverted;
    await expect(
      api3Oracle.connect(stranger).syncReserves(ethers.parseUnits("1", 18))
    ).to.be.revertedWith("API3Oracle: caller is not a feeder");
    await expect(
      token.connect(stranger).updateReserves(ethers.parseUnits("1", 18))
    ).to.be.revertedWith("PAH: caller is not the Kernel");
    await expect(
      token.connect(stranger).mint(recipient.address, MINT_AMOUNT, "unauthorized")
    ).to.be.reverted;

    await expectMonetaryState(token, monetaryBefore);
    await expectSwfSnapshotUnchanged(swfBefore);
    await expectTreasurySnapshotUnchanged(treasuryBefore);
  });

  it("replayed SWF and Treasury execution paths remain state-neutral and do not affect token reserve backing", async function () {
    await swf.connect(council1).depositToL1(ethers.parseUnits("10000", 18), "boundary setup");
    await swf.connect(council1).proposeWithdrawal(1, ethers.parseUnits("1000", 18), "boundary replay");
    await swf.connect(council2).signWithdrawal(1n);
    await swf.connect(council3).signWithdrawal(1n);

    await treasury.connect(parliament).createBudgetLine(0, ethers.parseUnits("10000", 18));
    await treasury.connect(government).proposeTransaction(
      recipient.address,
      ethers.parseUnits("1000", 18),
      1,
      "boundary replay"
    );
    await treasury.connect(auditor1).signTransaction(1n);
    await treasury.connect(auditor2).signTransaction(1n);

    const monetaryBefore = await tokenSnapshot(token);
    const swfBefore = await swfSnapshot();
    const treasuryBefore = await treasurySnapshot();
    const treasuryLineBefore = await treasury.getBudgetLine(1);
    const swfTxBefore = await swf.transactions(1n);
    const treasuryTxBefore = await treasury.getTransaction(1n);

    await expect(swf.connect(council2).signWithdrawal(1n))
      .to.be.revertedWith("SWF: already executed");
    await expect(treasury.connect(auditor1).signTransaction(1n))
      .to.be.revertedWith("Treasury: executed");

    await expectMonetaryState(token, monetaryBefore);
    await expectSwfSnapshotUnchanged(swfBefore);
    await expectTreasurySnapshotUnchanged(treasuryBefore);

    const swfTxAfter = await swf.transactions(1n);
    const treasuryTxAfter = await treasury.getTransaction(1n);
    const treasuryLineAfter = await treasury.getBudgetLine(1);
    expect(swfTxAfter.signaturesCount).to.equal(swfTxBefore.signaturesCount);
    expect(swfTxAfter.executed).to.equal(swfTxBefore.executed);
    expect(treasuryTxAfter.signaturesCount).to.equal(treasuryTxBefore.signaturesCount);
    expect(treasuryTxAfter.executed).to.equal(treasuryTxBefore.executed);
    expect(treasuryLineAfter.spent).to.equal(treasuryLineBefore.spent);
    expect(await token.totalReserves()).to.equal(0n);
  });

  it("existing mint-cap and reserve-floor behavior remains unchanged at recognized-backing boundary", async function () {
    const PahlaviToken = await ethers.getContractFactory("PahlaviToken");
    const boundaryToken = await PahlaviToken.deploy(
      swfMinter.address,
      oracle.address,
      ethers.parseUnits("333", 18)
    );
    await boundaryToken.waitForDeployment();

    await expect(
      boundaryToken.connect(swfMinter).mint(
        recipient.address,
        ethers.parseUnits("1000", 18),
        "reserve floor exact"
      )
    ).to.emit(boundaryToken, "PahlaviMinted");

    await expect(
      boundaryToken.connect(swfMinter).mint(recipient.address, 1n, "reserve floor over")
    ).to.be.revertedWith("PAH: reserve ratio below minimum 33.3%");
    expect(await boundaryToken.totalSupply()).to.equal(ethers.parseUnits("1000", 18));

    const capToken = await PahlaviToken.deploy(
      swfMinter.address,
      oracle.address,
      ethers.parseUnits("300000000000", 18)
    );
    await capToken.waitForDeployment();
    await capToken.connect(swfMinter).mint(
      recipient.address,
      ethers.parseUnits("900000000000", 18),
      "cap exact"
    );
    await expect(
      capToken.connect(swfMinter).mint(recipient.address, 1n, "cap over")
    ).to.be.revertedWith("PAH: exceeds liquidity cap");
    expect(await capToken.totalSupply()).to.equal(ethers.parseUnits("900000000000", 18));
  });

  it("documents that recognized-backing integration is explicit and not present on SWF/Treasury surfaces", async function () {
    const tokenFunctions = token.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);
    const swfFunctions = swf.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);
    const treasuryFunctions = treasury.interface.fragments
      .filter(fragment => fragment.type === "function")
      .map(fragment => fragment.name);

    expect(tokenFunctions).to.include("totalReserves");
    expect(tokenFunctions).to.include("updateReserves");
    expect(tokenFunctions).to.include("recognizedReserveBacking");
    expect(tokenFunctions).to.include("setRecognizedReserveBacking");
    expect(tokenFunctions).to.include("syncRecognizedBackingTotal");
    expect(tokenFunctions).to.not.include("recognizedBackingIdentity");
    expect(swfFunctions).to.not.include("recognizedReserveBacking");
    expect(swfFunctions).to.not.include("recognizedBackingIdentity");
    expect(treasuryFunctions).to.not.include("recognizedReserveBacking");
    expect(treasuryFunctions).to.not.include("recognizedBackingIdentity");

    await swf.connect(council1).depositToL1(ethers.parseUnits("1000", 18), "unclassified reserve asset");
    await treasury.connect(parliament).createBudgetLine(0, ethers.parseUnits("1000", 18));

    expect(await token.totalReserves()).to.equal(0n);
    expect(await token.canMint(1n)).to.be.false;
  });
});
