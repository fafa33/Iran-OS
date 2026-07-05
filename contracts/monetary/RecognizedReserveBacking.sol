// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RecognizedReserveBacking
 * @dev Minimal identity registry for recognized reserve backing. This contract
 *      enforces a runtime classification policy before any recorded identity can
 *      become monetary backing. It does not mint, burn, sync reserves, classify
 *      through oracles, or alter PahlaviToken.totalReserves.
 */
contract RecognizedReserveBacking is AccessControl {
    bytes32 public constant RECOGNIZER_ROLE = keccak256("RECOGNIZER_ROLE");

    enum BackingClass {
        Unset,
        RecognizedReserveBacking,
        TreasuryInventory,
        SovereignWealthFundAsset,
        BudgetAllocation,
        SpeculativeAsset,
        OracleReportedData,
        SovereignMonetaryReserve,
        ExplicitlyApprovedMonetaryReserve,
        AccountingRecord,
        Report,
        EventRecord,
        TemporaryHolding,
        ReclaimedAsset
    }

    struct BackingIdentity {
        BackingClass backingClass;
        uint256 value;
        address sourceContract;
        bytes32 sourceId;
        string evidence;
        uint256 recordedAt;
        address recordedBy;
        bool exists;
    }

    mapping(bytes32 => BackingIdentity) public identities;
    mapping(BackingClass => bool) public recognizedClassPolicy;
    uint256 public recognizedBackingTotal;

    event BackingIdentityRecorded(
        bytes32 indexed identityId,
        BackingClass indexed backingClass,
        uint256 value,
        address indexed sourceContract,
        bytes32 sourceId,
        address recordedBy,
        string evidence
    );

    event RecognizedClassPolicyUpdated(
        BackingClass indexed backingClass,
        bool permitted,
        address indexed updatedBy
    );

    constructor(address admin, address recognizer) {
        require(admin != address(0), "RRB: invalid admin");
        require(recognizer != address(0), "RRB: invalid recognizer");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RECOGNIZER_ROLE, recognizer);
        recognizedClassPolicy[BackingClass.RecognizedReserveBacking] = true;
        recognizedClassPolicy[BackingClass.SovereignMonetaryReserve] = true;
        recognizedClassPolicy[BackingClass.ExplicitlyApprovedMonetaryReserve] = true;
    }

    function deriveIdentityId(address sourceContract, bytes32 sourceId)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(sourceContract, sourceId));
    }

    function recordIdentity(
        BackingClass backingClass,
        uint256 value,
        address sourceContract,
        bytes32 sourceId,
        string calldata evidence
    )
        external
        onlyRole(RECOGNIZER_ROLE)
        returns (bytes32 identityId)
    {
        require(backingClass != BackingClass.Unset, "RRB: unset class");
        require(
            recognizedClassPolicy[backingClass],
            "RRB: class not recognized"
        );
        require(value > 0, "RRB: zero value");
        require(sourceContract != address(0), "RRB: invalid source");
        require(sourceId != bytes32(0), "RRB: invalid source id");
        require(bytes(evidence).length > 0, "RRB: evidence required");

        identityId = deriveIdentityId(sourceContract, sourceId);
        require(!identities[identityId].exists, "RRB: identity exists");

        identities[identityId] = BackingIdentity({
            backingClass: backingClass,
            value: value,
            sourceContract: sourceContract,
            sourceId: sourceId,
            evidence: evidence,
            recordedAt: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        recognizedBackingTotal += value;

        emit BackingIdentityRecorded(
            identityId,
            backingClass,
            value,
            sourceContract,
            sourceId,
            msg.sender,
            evidence
        );
    }

    function isRecognizedBacking(bytes32 identityId) external view returns (bool) {
        BackingIdentity storage identity = identities[identityId];
        return identity.exists && recognizedClassPolicy[identity.backingClass];
    }

    function recognizedBackingValue(bytes32 identityId) external view returns (uint256) {
        BackingIdentity storage identity = identities[identityId];
        if (!identity.exists || !recognizedClassPolicy[identity.backingClass]) {
            return 0;
        }
        return identity.value;
    }

    function setRecognizedClassPolicy(BackingClass backingClass, bool permitted)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(backingClass != BackingClass.Unset, "RRB: unset class");
        require(permitted, "RRB: cannot disable class");
        recognizedClassPolicy[backingClass] = permitted;
        emit RecognizedClassPolicyUpdated(backingClass, permitted, msg.sender);
    }
}
