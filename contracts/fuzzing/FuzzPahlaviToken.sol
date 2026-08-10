// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────────
// TEST-ONLY HARNESS — DO NOT DEPLOY TO PRODUCTION
//
// This file exists solely for Echidna property-based fuzzing.
// It grants itself MINTER_ROLE, BURNER_ROLE, and KERNEL_ROLE on PahlaviToken
// by passing address(this) as both _swf and _kernel in the constructor.
//
// This privileged setup is INTENTIONAL and REQUIRED for fuzzing.
// It must never appear in any production deployment script or migration.
//
// Tested invariants:
//   INV-01: totalSupply() <= MAX_SUPPLY (supply cap — TR-06 constitutional red line)
//           Result: PASSING. reserveCompliant modifier on mint() is sufficient.
//
//   INV-02: (totalReserves * 1000) / totalSupply() >= MIN_RESERVE_RATIO
//           Result: FAILING IN PRIVILEGED HARNESS; not currently production-reachable
//           based on available Kernel call paths. IranOS_Kernel holds KERNEL_ROLE on
//           PahlaviToken but contains no function that calls updateReserves(). The gap
//           becomes live if reserve sync is added to the Kernel without a floor guard.
//           Counterexample: doMint(1) → doUpdateReserves(0)
//           See: docs/reports/ECHIDNA_READINESS_ASSESSMENT.md §INV-02 production note.
//
// See: docs/reports/ECHIDNA_READINESS_ASSESSMENT.md
// ─────────────────────────────────────────────────────────────────────────────

import "../monetary/PahlaviToken.sol";

contract FuzzPahlaviToken {

    PahlaviToken public token;

    // Fixed non-zero receiver address for mint/burn targets.
    // Avoids the to != address(0) check inside PahlaviToken without
    // introducing address-manipulation complexity into the fuzz surface.
    address internal constant RECEIVER = address(0x1337);

    // Initial reserves equal to MAX_SUPPLY so the fuzzer can call doMint()
    // immediately without hitting the reserve ratio check on the first call.
    // Without this, the fuzzer spends its entire budget on reverted mints
    // and never reaches the doUpdateReserves(0) sequence that tests INV-02.
    uint256 internal constant INITIAL_RESERVES = 900_000_000_000 * 1e18;

    constructor() {
        // address(this) as both _swf and _kernel:
        //   _swf   → grants this contract MINTER_ROLE + BURNER_ROLE
        //   _kernel → grants this contract KERNEL_ROLE + PAUSER_ROLE + DEFAULT_ADMIN_ROLE
        // TEST-ONLY: this role setup must never exist in a production deployment.
        token = new PahlaviToken(
            address(this),   // _swf (TEST-ONLY: harness plays SWF role)
            address(this),   // _kernel (TEST-ONLY: harness plays Kernel role)
            INITIAL_RESERVES
        );
    }

    // ─────────────────────────────────────────
    // Fuzz entry points (public = callable by Echidna)
    // ─────────────────────────────────────────

    /// @dev Mint PAH to RECEIVER. Reverts are acceptable (Echidna handles them).
    function doMint(uint256 amount) public {
        token.mint(RECEIVER, amount, "fuzz");
    }

    /// @dev Burn PAH from RECEIVER. Reverts when balance < amount are acceptable.
    function doBurn(uint256 amount) public {
        token.burn(RECEIVER, amount, "fuzz");
    }

    /// @dev Update reserve value. Accepts any uint256 including 0.
    ///      This is the primary vector for INV-02: doMint(x) → doUpdateReserves(0)
    ///      will reduce reserves to zero while supply remains positive, breaking ratio.
    function doUpdateReserves(uint256 newReserves) public {
        token.updateReserves(newReserves);
    }

    // ─────────────────────────────────────────
    // Echidna invariant properties
    // ─────────────────────────────────────────

    /// INV-01: PAH supply cap — TR-06 constitutional red line.
    /// Expected: always true. The reserveCompliant modifier on mint() enforces this.
    /// A failure here indicates harness misconfiguration, not a contract bug.
    function echidna_supply_cap() public view returns (bool) {
        return token.totalSupply() <= token.MAX_SUPPLY();
    }

    /// INV-02: Reserve ratio floor — 33.3% minimum at all times.
    /// Status: FAILING IN PRIVILEGED HARNESS; not currently production-reachable
    ///   based on available Kernel call paths.
    /// Counterexample (confirmed): doMint(1) → doUpdateReserves(0)
    ///   After: totalSupply = 1, totalReserves = 0 → (0*1000)/1 = 0 < 333 → FAILS
    /// Root gap: updateReserves() accepts any uint256 with no lower-bound guard
    ///   and no post-update ratio check. The mint-time reserveCompliant modifier
    ///   does not protect against post-mint reserve reduction.
    /// Production note: IranOS_Kernel (the sole KERNEL_ROLE holder on PahlaviToken)
    ///   has no function that calls PahlaviToken.updateReserves(). The gap is
    ///   forward-looking: it activates if reserve sync is wired into the Kernel
    ///   without adding a corresponding floor guard to updateReserves() first.
    function echidna_reserve_ratio() public view returns (bool) {
        uint256 supply = token.totalSupply();
        if (supply == 0) return true;
        return (token.totalReserves() * 1000) / supply >= token.MIN_RESERVE_RATIO();
    }
}
