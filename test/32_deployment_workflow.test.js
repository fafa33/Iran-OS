// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
// Deployment workflow characterization — exercises deploy/index.js against
// docs/deployment/DEPLOYMENT_MANIFEST_PROTOCOL.md and
// docs/deployment/ROLE_WIRING_CHECKLIST.md for the six core contracts
// (Kernel, Treasury, SovereignWealthFund, PahlaviToken, API3Oracle,
// RecognizedReserveBacking).

const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const { runDeployment, assertNoExistingDeployment } = require("../deploy/index");
const { loadConfig } = require("../deploy/config");

describe("Deployment Workflow (deploy/)", function () {
  let sovereign, court1, court2, court3, court4, court5, court6, court7, court8, court9;
  let oracleInitial, swfMultisig, feeder1, feeder2, recognizer;
  let courtMembers2to9;

  before(async function () {
    [
      sovereign,
      court1,
      court2,
      court3,
      court4,
      court5,
      court6,
      court7,
      court8,
      court9,
      oracleInitial,
      swfMultisig,
      feeder1,
      feeder2,
      recognizer,
    ] = await ethers.getSigners();

    courtMembers2to9 = [court2, court3, court4, court5, court6, court7, court8, court9];

    process.env.SOVEREIGN_ADDRESS = sovereign.address;
    process.env.COURT_1 = court1.address;
    courtMembers2to9.forEach((signer, i) => {
      process.env[`COURT_${i + 2}`] = signer.address;
    });
    process.env.ORACLE_INITIAL = oracleInitial.address;
    process.env.SWF_MULTISIG = swfMultisig.address;
    process.env.FEEDER_ADDRESSES = `${feeder1.address},${feeder2.address}`;
    process.env.RECOGNIZER_ADDRESS = recognizer.address;
    process.env.INITIAL_RESERVES = "0";
  });

  it("deploys and wires all six core contracts, passing every documented post-deploy check", async function () {
    const config = loadConfig();
    const { addresses, checks } = await runDeployment(hre, config, sovereign);

    for (const [name, address] of Object.entries(addresses)) {
      expect(ethers.isAddress(address), `${name} is not a valid address`).to.be.true;
      expect(address, `${name} must not be the zero address`).to.not.equal(ethers.ZeroAddress);
    }

    expect(checks.length).to.be.greaterThan(0);
    for (const c of checks) {
      expect(c.pass, `check failed: ${c.name}`).to.be.true;
    }
  });

  it("wires all 9 court members reaching the 7-of-9 multisig threshold", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const COURT_ROLE = await kernel.COURT_ROLE();

    expect(await kernel.hasRole(COURT_ROLE, court1.address)).to.be.true;
    for (const member of courtMembers2to9) {
      expect(await kernel.hasRole(COURT_ROLE, member.address)).to.be.true;
    }
  });

  it("registers API3Oracle as the sole ORACLE_ROLE holder and revokes the ORACLE_INITIAL placeholder", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();

    expect(await kernel.hasRole(ORACLE_ROLE, addresses.API3_ORACLE_ADDRESS)).to.be.true;
    expect(await kernel.hasRole(ORACLE_ROLE, oracleInitial.address)).to.be.false;
  });

  it("wires Kernel.pahlaviToken() (GAP-MEX-05) before any reserve-path call is reachable", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);

    expect(await kernel.pahlaviToken()).to.equal(addresses.PAHLAVI_TOKEN_ADDRESS);
  });

  it("atomically links RecognizedReserveBacking and syncs totalReserves in the same transaction", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
    const registry = await ethers.getContractAt(
      "RecognizedReserveBacking",
      addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS
    );

    expect(await token.recognizedReserveBacking()).to.equal(addresses.RECOGNIZED_RESERVE_BACKING_ADDRESS);
    expect(await token.totalReserves()).to.equal(await registry.recognizedBackingTotal());
  });

  it("deploys VictimFund, ConstitutionGuard, JurySelection, JusticeProtocol, and CitizenCard with the documented constructor-granted roles", async function () {
    const config = loadConfig();
    const { addresses, checks } = await runDeployment(hre, config, sovereign);

    for (const c of checks) {
      expect(c.pass, `check failed: ${c.name}`).to.be.true;
    }

    const victimFund = await ethers.getContractAt("VictimFund", addresses.VICTIM_FUND_ADDRESS);
    const constitutionGuard = await ethers.getContractAt("ConstitutionGuard", addresses.CONSTITUTION_GUARD_ADDRESS);
    const jurySelection = await ethers.getContractAt("JurySelection", addresses.JURY_SELECTION_ADDRESS);
    const justiceProtocol = await ethers.getContractAt("JusticeProtocol", addresses.JUSTICE_PROTOCOL_ADDRESS);
    const citizenCard = await ethers.getContractAt("CitizenCard", addresses.CITIZEN_CARD_ADDRESS);

    // DEFAULT_ADMIN_ROLE is held by SOVEREIGN_ADDRESS (a real signer), not
    // KERNEL_ADDRESS: the Kernel contract has no call-forwarding mechanism to
    // these contracts and could never exercise DEFAULT_ADMIN_ROLE itself.
    // KERNEL_ROLE continues to record the Kernel contract's identity.
    for (const contract of [victimFund, jurySelection, justiceProtocol, citizenCard]) {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const KERNEL_ROLE = await contract.KERNEL_ROLE();
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, config.sovereignAddress)).to.be.true;
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, addresses.KERNEL_ADDRESS)).to.be.false;
      expect(await contract.hasRole(KERNEL_ROLE, addresses.KERNEL_ADDRESS)).to.be.true;
    }
    expect(await constitutionGuard.admin()).to.equal(config.sovereignAddress);
    expect(await constitutionGuard.kernel()).to.equal(addresses.KERNEL_ADDRESS);
  });

  it("deploys Treasury via the real orchestrated path with sovereign as DEFAULT_ADMIN_ROLE, and TriggerProtocol's KERNEL_ROLE grant is reachable from that admin", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);

    const treasury = await ethers.getContractAt("Treasury", addresses.TREASURY_ADDRESS);
    const DEFAULT_ADMIN_ROLE = await treasury.DEFAULT_ADMIN_ROLE();
    const KERNEL_ROLE = await treasury.KERNEL_ROLE();

    // DEFAULT_ADMIN_ROLE is held by SOVEREIGN_ADDRESS (a real signer), not
    // KERNEL_ADDRESS: the Kernel contract has no call-forwarding mechanism to
    // Treasury and could never exercise DEFAULT_ADMIN_ROLE itself (TG-01).
    expect(await treasury.hasRole(DEFAULT_ADMIN_ROLE, config.sovereignAddress)).to.be.true;
    expect(await treasury.hasRole(DEFAULT_ADMIN_ROLE, addresses.KERNEL_ADDRESS)).to.be.false;
    expect(await treasury.hasRole(KERNEL_ROLE, addresses.KERNEL_ADDRESS)).to.be.true;

    // Reachability proof, against the Treasury instance this orchestration
    // actually produced (not a hand-rolled duplicate): sovereign grants
    // KERNEL_ROLE to a real TriggerProtocol wired to the same real Kernel and
    // this Treasury, using only the DEFAULT_ADMIN_ROLE it was just shown to
    // hold above — proving docs/deployment/ROLE_WIRING_CHECKLIST.md §ب row 1
    // ("sovereign" as the documented caller) is not just documentation but
    // reachable on the exact production caller path. (executeTrigger() itself
    // is gated onlyKernel — msg.sender == the Kernel contract, not sovereign —
    // and is already exercised end-to-end via test/08_Trigger_Protocol.test.js;
    // this test's scope is the role-grant reachability this PR fixes, not a
    // duplicate of that coverage.)
    const swf = await ethers.getContractAt("SovereignWealthFund", addresses.SWF_ADDRESS);
    const Trigger = await ethers.getContractFactory("TriggerProtocol");
    const trigger = await Trigger.deploy(addresses.KERNEL_ADDRESS, addresses.TREASURY_ADDRESS, await swf.getAddress());
    await trigger.waitForDeployment();

    expect(await treasury.hasRole(KERNEL_ROLE, await trigger.getAddress())).to.be.false;
    await treasury.connect(sovereign).grantRole(KERNEL_ROLE, await trigger.getAddress());
    expect(await treasury.hasRole(KERNEL_ROLE, await trigger.getAddress())).to.be.true;
  });

  it("deploys PriceOracle successfully, with a non-zero address, without altering monetary runtime state, and preserving all other deployment invariants", async function () {
    const config = loadConfig();
    const { addresses, checks } = await runDeployment(hre, config, sovereign);

    // Existing deployment invariants remain intact (§9 checks, extended in
    // deploy/09_verify.js to include PriceOracle's constructor-role checks).
    for (const c of checks) {
      expect(c.pass, `check failed: ${c.name}`).to.be.true;
    }

    // Deploys successfully, with a non-zero address.
    expect(ethers.isAddress(addresses.PRICE_ORACLE_ADDRESS)).to.be.true;
    expect(addresses.PRICE_ORACLE_ADDRESS).to.not.equal(ethers.ZeroAddress);

    const priceOracle = await ethers.getContractAt("PriceOracle", addresses.PRICE_ORACLE_ADDRESS);
    const DEFAULT_ADMIN_ROLE = await priceOracle.DEFAULT_ADMIN_ROLE();
    const KERNEL_ROLE = await priceOracle.KERNEL_ROLE();
    expect(await priceOracle.hasRole(DEFAULT_ADMIN_ROLE, config.sovereignAddress)).to.be.true;
    expect(await priceOracle.hasRole(DEFAULT_ADMIN_ROLE, addresses.KERNEL_ADDRESS)).to.be.false;
    expect(await priceOracle.hasRole(KERNEL_ROLE, addresses.KERNEL_ADDRESS)).to.be.true;

    // Does not alter monetary runtime state: PriceOracle's constructor only
    // writes to its own storage (an initial KEY_PAH_USD price point). Deploy
    // it a second time, directly, and confirm PahlaviToken/SWF/Treasury
    // monetary state captured immediately beforehand is bit-for-bit
    // unchanged immediately afterward.
    const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
    const swf = await ethers.getContractAt("SovereignWealthFund", addresses.SWF_ADDRESS);
    const treasury = await ethers.getContractAt("Treasury", addresses.TREASURY_ADDRESS);

    const totalReservesBefore = await token.totalReserves();
    const totalAssetsBefore = await swf.totalAssets();
    const budgetAllocatedBefore = await treasury.totalBudgetAllocated();

    const { deployPriceOracle } = require("../deploy/15_price_oracle");
    const { address: secondPriceOracleAddress } = await deployPriceOracle(hre, config, addresses);
    expect(ethers.isAddress(secondPriceOracleAddress)).to.be.true;
    expect(secondPriceOracleAddress).to.not.equal(ethers.ZeroAddress);
    expect(secondPriceOracleAddress).to.not.equal(addresses.PRICE_ORACLE_ADDRESS);

    expect(await token.totalReserves()).to.equal(totalReservesBefore);
    expect(await swf.totalAssets()).to.equal(totalAssetsBefore);
    expect(await treasury.totalBudgetAllocated()).to.equal(budgetAllocatedBefore);
  });

  describe("Layer 1 contract deployment-path parity (real Kernel contract address, not an EOA stand-in)", function () {
    // Hostile-review finding: PR #118 deployed VictimFund, ConstitutionGuard,
    // JurySelection, JusticeProtocol, and CitizenCard with KERNEL_ADDRESS as
    // sole admin/kernel. Confirmed (see contracts/kernel.sol) that the Kernel
    // contract has no generic call-forwarding, delegatecall, or any function
    // referencing these 5 contracts -- so it could never itself exercise
    // DEFAULT_ADMIN_ROLE/KERNEL_ROLE-gated privileges against them. This
    // block proves the fix end-to-end using the *actual* deployed Kernel
    // contract's address (addresses.KERNEL_ADDRESS from deployKernel, not a
    // plain EOA standing in for "kernel"), and the real SOVEREIGN_ADDRESS
    // signer already used throughout this suite -- not test-only shortcuts.
    let addresses;

    beforeEach(async function () {
      const config = loadConfig();
      ({ addresses } = await runDeployment(hre, config, sovereign));
    });

    it("Sovereign (real signer) can grant operational roles post-deploy against the real Kernel-contract-backed VictimFund", async function () {
      const victimFund = await ethers.getContractAt("VictimFund", addresses.VICTIM_FUND_ADDRESS);
      const COURT_ROLE = await victimFund.COURT_ROLE();

      // Would have been impossible under the pre-fix deployment: only
      // KERNEL_ADDRESS (a contract with no forwarding mechanism) held
      // DEFAULT_ADMIN_ROLE, so no COURT_ROLE grant -- and therefore no
      // registerVictim() call -- could ever reach mainnet.
      await victimFund.connect(sovereign).grantRole(COURT_ROLE, court1.address);
      expect(await victimFund.hasRole(COURT_ROLE, court1.address)).to.be.true;

      await expect(
        victimFund.connect(court1).registerVictim(courtMembers2to9[0].address, 0, 1, 1000n)
      ).to.emit(victimFund, "VictimRegistered");
    });

    it("Sovereign (real signer) can grant VRF_ROLE post-deploy against the real Kernel-contract-backed JurySelection", async function () {
      const jurySelection = await ethers.getContractAt("JurySelection", addresses.JURY_SELECTION_ADDRESS);
      const VRF_ROLE = await jurySelection.VRF_ROLE();

      await jurySelection.connect(sovereign).grantRole(VRF_ROLE, court1.address);
      expect(await jurySelection.hasRole(VRF_ROLE, court1.address)).to.be.true;

      const commitments = Array.from({ length: 12 }, (_, i) =>
        ethers.keccak256(ethers.toUtf8Bytes(`parity_juror_${i}`))
      );
      await expect(jurySelection.connect(court1).selectJury(1, commitments))
        .to.emit(jurySelection, "JurySelected");
    });

    it("Sovereign (real signer) can call approveJudge (KERNEL_ROLE-gated) via a role it grants post-deploy on the real Kernel-contract-backed JusticeProtocol", async function () {
      const justiceProtocol = await ethers.getContractAt("JusticeProtocol", addresses.JUSTICE_PROTOCOL_ADDRESS);
      const KERNEL_ROLE = await justiceProtocol.KERNEL_ROLE();

      // Demonstrates the general escape hatch DEFAULT_ADMIN_ROLE now provides:
      // Sovereign can delegate KERNEL_ROLE itself to any real operational
      // address, not only the specific roles already granted in this test.
      await justiceProtocol.connect(sovereign).grantRole(KERNEL_ROLE, court1.address);
      await expect(justiceProtocol.connect(court1).approveJudge(courtMembers2to9[0].address))
        .to.not.be.reverted;
      expect(await justiceProtocol.approvedJudges(courtMembers2to9[0].address)).to.be.true;
    });

    it("Sovereign (real signer) can register an employer via KERNEL_ROLE it grants post-deploy on the real Kernel-contract-backed CitizenCard", async function () {
      const citizenCard = await ethers.getContractAt("CitizenCard", addresses.CITIZEN_CARD_ADDRESS);
      const KERNEL_ROLE = await citizenCard.KERNEL_ROLE();

      await citizenCard.connect(sovereign).grantRole(KERNEL_ROLE, court1.address);
      await expect(citizenCard.connect(court1).registerEmployer(courtMembers2to9[0].address))
        .to.emit(citizenCard, "EmployerRegistered");
    });

    it("Sovereign (real signer, not an EOA standing in for Kernel) can approveLaw directly on the real Kernel-contract-backed ConstitutionGuard", async function () {
      const constitutionGuard = await ethers.getContractAt("ConstitutionGuard", addresses.CONSTITUTION_GUARD_ADDRESS);
      const lawHash = ethers.keccak256(ethers.toUtf8Bytes("deployment-path-parity law"));
      await constitutionGuard.connect(court1).proposeLaw(lawHash, 0x18); // bits 3+4, non-immutable

      await expect(constitutionGuard.connect(sovereign).approveLaw(lawHash))
        .to.emit(constitutionGuard, "LawApproved");
      expect(await constitutionGuard.isLawApproved(lawHash)).to.be.true;
    });

    it("verifyDeployment passes when SOVEREIGN_ADDRESS is supplied in non-checksummed (lower-case) form", async function () {
      // Codex review finding on PR #119: 09_verify.js compared
      // constitutionGuard.admin() (always checksummed by ethers) against the
      // raw config.sovereignAddress string via strict `===`. deploy/config.js
      // does no normalization, so a syntactically-valid, on-chain-correct
      // deployment using a lower-case SOVEREIGN_ADDRESS would fail
      // verification with no actual on-chain problem. Reproduces that exact
      // scenario end-to-end through runDeployment()'s own verifyDeployment
      // call, not just the isolated check function.
      const originalSovereignAddress = process.env.SOVEREIGN_ADDRESS;
      try {
        process.env.SOVEREIGN_ADDRESS = sovereign.address.toLowerCase();
        const lowerCaseConfig = loadConfig();
        expect(lowerCaseConfig.sovereignAddress).to.equal(sovereign.address.toLowerCase());

        const { checks } = await runDeployment(hre, lowerCaseConfig, sovereign);
        for (const c of checks) {
          expect(c.pass, `check failed: ${c.name}`).to.be.true;
        }
      } finally {
        process.env.SOVEREIGN_ADDRESS = originalSovereignAddress;
      }
    });
  });

  it("leaves the deployed system in the documented clean initial state", async function () {
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const oracle = await ethers.getContractAt("API3Oracle", addresses.API3_ORACLE_ADDRESS);
    const swf = await ethers.getContractAt("SovereignWealthFund", addresses.SWF_ADDRESS);

    expect(await kernel.isSystemHealthy()).to.be.true;
    expect(await kernel.emergencyLockActive()).to.be.false;
    expect(await kernel.violationCount()).to.equal(0n);
    expect(await kernel.triggerActivationCount()).to.equal(0n);
    expect(await oracle.violationFlagCount()).to.equal(0n);
    expect(await swf.totalAssets()).to.equal(0n);
  });

  it("throws a clear error when a required deployment config variable is missing", function () {
    const original = process.env.SOVEREIGN_ADDRESS;
    delete process.env.SOVEREIGN_ADDRESS;
    try {
      expect(() => loadConfig()).to.throw(/SOVEREIGN_ADDRESS/);
    } finally {
      process.env.SOVEREIGN_ADDRESS = original;
    }
  });

  it("throws when a later script's address-book prerequisite is missing", async function () {
    const { deployToken } = require("../deploy/02_token");
    const config = loadConfig();
    let error;
    try {
      await deployToken(hre, config, {}, sovereign);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/KERNEL_ADDRESS/);
  });

  it("blocks Oracle activation (08_finalize.js) if Court completion (07_roles.js) has not run yet", async function () {
    const config = loadConfig();
    const { deployKernel } = require("../deploy/01_kernel");
    const { deployOracle } = require("../deploy/04_oracle");
    const { finalizeOracleActivation } = require("../deploy/08_finalize");

    const { address: kernelAddress } = await deployKernel(hre, config);
    const addresses = { KERNEL_ADDRESS: kernelAddress };
    const { address: oracleAddress } = await deployOracle(hre, config, addresses);
    addresses.API3_ORACLE_ADDRESS = oracleAddress;

    // Only COURT_1 exists at this point (from Kernel's constructor) —
    // 07_roles.js was never run, so members 2-9 do not hold COURT_ROLE yet.
    let error;
    try {
      await finalizeOracleActivation(hre, config, addresses, sovereign);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/07_roles\.js/);

    const kernel = await ethers.getContractAt("IranOS_Kernel", kernelAddress);
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    expect(await kernel.hasRole(ORACLE_ROLE, oracleAddress)).to.be.false;
  });

  it("blocks Oracle activation (08_finalize.js) if two configured court addresses are not distinct", async function () {
    const config = loadConfig();
    const duplicated = {
      ...config,
      courtMembers2to9: [config.court1, ...config.courtMembers2to9.slice(1)],
    };

    const { deployKernel } = require("../deploy/01_kernel");
    const { deployOracle } = require("../deploy/04_oracle");
    const { wireCourtCompletion } = require("../deploy/07_roles");
    const { finalizeOracleActivation } = require("../deploy/08_finalize");

    const addresses = {};
    addresses.KERNEL_ADDRESS = (await deployKernel(hre, duplicated)).address;
    addresses.API3_ORACLE_ADDRESS = (await deployOracle(hre, duplicated, addresses)).address;
    // wireCourtCompletion grants COURT_ROLE to the (duplicated) list; the
    // duplicate is a no-op re-grant, so this itself does not throw -- the
    // rejection must happen in finalizeOracleActivation, before ORACLE_ROLE
    // is ever granted.
    await wireCourtCompletion(hre, duplicated, addresses, sovereign);

    let error;
    try {
      await finalizeOracleActivation(hre, duplicated, addresses, sovereign);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/pairwise-distinct/);

    const kernel = await ethers.getContractAt("IranOS_Kernel", addresses.KERNEL_ADDRESS);
    const ORACLE_ROLE = await kernel.ORACLE_ROLE();
    expect(await kernel.hasRole(ORACLE_ROLE, addresses.API3_ORACLE_ADDRESS)).to.be.false;
  });

  it("verifyDeployment still rejects duplicate court addresses as defense-in-depth", async function () {
    // Exercises 09_verify.js's own independent uniqueness check directly,
    // in case it is ever invoked standalone against a config that was not
    // first screened by 08_finalize.js's guard.
    const config = loadConfig();
    const { addresses } = await runDeployment(hre, config, sovereign);
    const duplicated = {
      ...config,
      courtMembers2to9: [config.court1, ...config.courtMembers2to9.slice(1)],
    };

    const { verifyDeployment } = require("../deploy/09_verify");
    let error;
    try {
      await verifyDeployment(hre, duplicated, addresses);
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.message).to.match(/pairwise-distinct/);
  });

  it("exports the expected function from every deploy/ script (catches CLI-wiring regressions)", function () {
    const expectedExports = {
      "../deploy/01_kernel": "deployKernel",
      "../deploy/02_token": "deployToken",
      "../deploy/03_recognized_backing": "deployRecognizedBacking",
      "../deploy/04_oracle": "deployOracle",
      "../deploy/05_treasury": "deployTreasury",
      "../deploy/06_swf": "deploySwf",
      "../deploy/07_roles": "wireCourtCompletion",
      "../deploy/08_finalize": "finalizeOracleActivation",
      "../deploy/09_verify": "verifyDeployment",
      "../deploy/10_victim_fund": "deployVictimFund",
      "../deploy/11_constitution_guard": "deployConstitutionGuard",
      "../deploy/12_jury_selection": "deployJurySelection",
      "../deploy/13_justice_protocol": "deployJusticeProtocol",
      "../deploy/14_citizen_card": "deployCitizenCard",
      "../deploy/15_price_oracle": "deployPriceOracle",
      "../deploy/index": "runDeployment",
    };
    expect(require("../deploy/index").assertNoExistingDeployment, "../deploy/index must export assertNoExistingDeployment").to.be.a("function");
    for (const [modulePath, exportName] of Object.entries(expectedExports)) {
      const mod = require(modulePath);
      expect(mod[exportName], `${modulePath} must export ${exportName}`).to.be.a("function");
    }
    // Note: this only verifies module.exports shape. The standalone CLI
    // entry points (the `if (require.main === module)` blocks, invoked via
    // `npx hardhat run deploy/0N_*.js --network <network>`) are not
    // exercised by this suite and were verified manually against a
    // persistent local node — see deploy/README.md.
  });

  describe("nonzero INITIAL_RESERVES reset guard (03_recognized_backing.js)", function () {
    let nonzeroConfig;

    beforeEach(function () {
      nonzeroConfig = { ...loadConfig(), initialReserves: "5000" };
    });

    it("blocks wiring a fresh (empty) registry to a token with nonzero totalReserves unless acknowledged", async function () {
      const { deployKernel } = require("../deploy/01_kernel");
      const { deployTreasury } = require("../deploy/05_treasury");
      const { deploySwf } = require("../deploy/06_swf");
      const { deployToken } = require("../deploy/02_token");
      const { deployRecognizedBacking } = require("../deploy/03_recognized_backing");

      const addresses = {};
      addresses.KERNEL_ADDRESS = (await deployKernel(hre, nonzeroConfig)).address;
      addresses.TREASURY_ADDRESS = (await deployTreasury(hre, nonzeroConfig, addresses)).address;
      addresses.SWF_ADDRESS = (await deploySwf(hre, nonzeroConfig, addresses)).address;
      addresses.PAHLAVI_TOKEN_ADDRESS = (await deployToken(hre, nonzeroConfig, addresses, sovereign)).address;

      const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
      expect(await token.totalReserves()).to.equal(5000n);

      let error;
      try {
        await deployRecognizedBacking(hre, nonzeroConfig, addresses, sovereign);
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/Reserve reset blocked/);
      expect(error.message).to.match(/ACKNOWLEDGE_RESERVE_RESET/);

      // Nothing was mutated on-chain by the blocked attempt.
      expect(await token.totalReserves()).to.equal(5000n);
      expect(await token.recognizedReserveBacking()).to.equal(ethers.ZeroAddress);
    });

    it("does not deploy a RecognizedReserveBacking contract on the blocked path (guard runs before deployment, not after)", async function () {
      const { deployKernel } = require("../deploy/01_kernel");
      const { deployTreasury } = require("../deploy/05_treasury");
      const { deploySwf } = require("../deploy/06_swf");
      const { deployToken } = require("../deploy/02_token");
      const { deployRecognizedBacking } = require("../deploy/03_recognized_backing");

      const addresses = {};
      addresses.KERNEL_ADDRESS = (await deployKernel(hre, nonzeroConfig)).address;
      addresses.TREASURY_ADDRESS = (await deployTreasury(hre, nonzeroConfig, addresses)).address;
      addresses.SWF_ADDRESS = (await deploySwf(hre, nonzeroConfig, addresses)).address;
      addresses.PAHLAVI_TOKEN_ADDRESS = (await deployToken(hre, nonzeroConfig, addresses, sovereign)).address;

      // The default signer used by ethers.getContractFactory (no explicit
      // signer passed in deployRecognizedBacking) is the first configured
      // account -- the same signer index sovereign was destructured from in
      // this suite's before() hook. If the guard rejects before deploying
      // the registry, that signer's transaction count must be unchanged: no
      // deployment (or any other) transaction was ever broadcast.
      const [deployer] = await ethers.getSigners();
      const nonceBefore = await ethers.provider.getTransactionCount(deployer.address);

      let error;
      try {
        await deployRecognizedBacking(hre, nonzeroConfig, addresses, sovereign);
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;

      const nonceAfter = await ethers.provider.getTransactionCount(deployer.address);
      expect(
        nonceAfter,
        "guard must reject before any contract-deployment transaction is sent -- " +
        "a nonce increase here would mean RecognizedReserveBacking was deployed " +
        "(and orphaned) on the blocked path"
      ).to.equal(nonceBefore);
    });

    it("proceeds with the reset when ACKNOWLEDGE_RESERVE_RESET is explicitly set", async function () {
      nonzeroConfig.acknowledgeReserveReset = true;

      const { deployKernel } = require("../deploy/01_kernel");
      const { deployTreasury } = require("../deploy/05_treasury");
      const { deploySwf } = require("../deploy/06_swf");
      const { deployToken } = require("../deploy/02_token");
      const { deployRecognizedBacking } = require("../deploy/03_recognized_backing");

      const addresses = {};
      addresses.KERNEL_ADDRESS = (await deployKernel(hre, nonzeroConfig)).address;
      addresses.TREASURY_ADDRESS = (await deployTreasury(hre, nonzeroConfig, addresses)).address;
      addresses.SWF_ADDRESS = (await deploySwf(hre, nonzeroConfig, addresses)).address;
      addresses.PAHLAVI_TOKEN_ADDRESS = (await deployToken(hre, nonzeroConfig, addresses, sovereign)).address;

      const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
      expect(await token.totalReserves()).to.equal(5000n);

      const { address: registryAddress } = await deployRecognizedBacking(hre, nonzeroConfig, addresses, sovereign);

      expect(await token.recognizedReserveBacking()).to.equal(registryAddress);
      expect(await token.totalReserves()).to.equal(0n);
    });

    it("does not block wiring when INITIAL_RESERVES is zero (the documented default flow)", async function () {
      const config = loadConfig(); // process.env.INITIAL_RESERVES === "0" from the outer before()
      const { addresses } = await runDeployment(hre, config, sovereign);
      const token = await ethers.getContractAt("PahlaviToken", addresses.PAHLAVI_TOKEN_ADDRESS);
      expect(await token.totalReserves()).to.equal(0n);
    });
  });

  describe("refuses to overwrite an existing deployment (deploy/index.js CLI guard)", function () {
    it("throws if the address book already contains a core-path address for this network", function () {
      const existing = { KERNEL_ADDRESS: ethers.ZeroAddress };
      let error;
      try {
        assertNoExistingDeployment(existing, "localhost");
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/already contains deployment artifacts/);
      expect(error.message).to.match(/KERNEL_ADDRESS/);
      expect(error.message).to.match(/does not auto-resume/);
    });

    it("throws listing every core-path key already present, not just the first", function () {
      const existing = {
        KERNEL_ADDRESS: ethers.ZeroAddress,
        TREASURY_ADDRESS: ethers.ZeroAddress,
        RECOGNIZED_RESERVE_BACKING_ADDRESS: ethers.ZeroAddress,
      };
      let error;
      try {
        assertNoExistingDeployment(existing, "localhost");
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.message).to.match(/KERNEL_ADDRESS/);
      expect(error.message).to.match(/TREASURY_ADDRESS/);
      expect(error.message).to.match(/RECOGNIZED_RESERVE_BACKING_ADDRESS/);
    });

    it("does not throw when the address book is empty (fresh deployment target)", function () {
      expect(() => assertNoExistingDeployment({}, "localhost")).to.not.throw();
    });

    it("does not throw when the address book has unrelated keys only", function () {
      expect(() => assertNoExistingDeployment({ SOME_OTHER_KEY: "0x1" }, "localhost")).to.not.throw();
    });
  });

  describe("incremental address persistence (deploy/index.js)", function () {
    it("calls persistStep after every successful deployment step, not just once at the end", async function () {
      const config = loadConfig();
      const snapshots = [];
      const persistStep = (addresses) => snapshots.push({ ...addresses });

      await runDeployment(hre, config, sovereign, persistStep);

      // 13 deploy steps persist addresses individually, and TriggerProtocol
      // wiring adds one additional persistence checkpoint after its Treasury
      // role and Kernel pointer postconditions are satisfied.
      expect(snapshots.length).to.equal(14);
      expect(Object.keys(snapshots[0])).to.deep.equal(["KERNEL_ADDRESS"]);
      expect(Object.keys(snapshots[13]).sort()).to.deep.equal(
        [
          "KERNEL_ADDRESS",
          "TREASURY_ADDRESS",
          "SWF_ADDRESS",
          "TRIGGER_PROTOCOL_ADDRESS",
          "VICTIM_FUND_ADDRESS",
          "CONSTITUTION_GUARD_ADDRESS",
          "JURY_SELECTION_ADDRESS",
          "JUSTICE_PROTOCOL_ADDRESS",
          "CITIZEN_CARD_ADDRESS",
          "PRICE_ORACLE_ADDRESS",
          "PAHLAVI_TOKEN_ADDRESS",
          "API3_ORACLE_ADDRESS",
          "RECOGNIZED_RESERVE_BACKING_ADDRESS",
        ].sort()
      );
    });

    it("preserves already-deployed addresses via persistStep even when a later step throws", async function () {
      const config = loadConfig();
      const duplicated = {
        ...config,
        courtMembers2to9: [config.court1, ...config.courtMembers2to9.slice(1)],
      };
      let lastSnapshot = null;
      const persistStep = (addresses) => { lastSnapshot = { ...addresses }; };

      let error;
      try {
        // wireCourtCompletion/finalizeOracleActivation will fail on the
        // duplicate court member, after all 13 deploy steps already
        // succeeded and persisted; TriggerProtocol authority wiring has not run.
        await runDeployment(hre, duplicated, sovereign, persistStep);
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;

      expect(lastSnapshot).to.not.be.null;
      expect(Object.keys(lastSnapshot).sort()).to.deep.equal(
        [
          "KERNEL_ADDRESS",
          "TREASURY_ADDRESS",
          "SWF_ADDRESS",
          "TRIGGER_PROTOCOL_ADDRESS",
          "VICTIM_FUND_ADDRESS",
          "CONSTITUTION_GUARD_ADDRESS",
          "JURY_SELECTION_ADDRESS",
          "JUSTICE_PROTOCOL_ADDRESS",
          "CITIZEN_CARD_ADDRESS",
          "PRICE_ORACLE_ADDRESS",
          "PAHLAVI_TOKEN_ADDRESS",
          "API3_ORACLE_ADDRESS",
          "RECOGNIZED_RESERVE_BACKING_ADDRESS",
        ].sort()
      );
      // All 13 addresses are real, non-zero deployed contract addresses,
      // even though the overall run() call above threw.
      for (const [name, address] of Object.entries(lastSnapshot)) {
        expect(ethers.isAddress(address), `${name} is not a valid address`).to.be.true;
        expect(address, `${name} must not be the zero address`).to.not.equal(ethers.ZeroAddress);
      }
    });
  });
});
