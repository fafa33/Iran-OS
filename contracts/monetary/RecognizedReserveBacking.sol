// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RecognizedReserveBacking
 * @dev Minimal identity registry for recognized reserve backing and adjacent
 *      non-recognized accounting surfaces. This contract records identity only:
 *      it does not mint, burn, sync reserves, classify through oracles, or alter
 *      PahlaviToken.totalReserves.
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
        OracleReportedData
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

    constructor(address admin, address recognizer) {
        require(admin != address(0), "RRB: invalid admin");
        require(recognizer != address(0), "RRB: invalid recognizer");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RECOGNIZER_ROLE, recognizer);
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

        if (backingClass == BackingClass.RecognizedReserveBacking) {
            recognizedBackingTotal += value;
        }

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
        return identity.exists && identity.backingClass == BackingClass.RecognizedReserveBacking;
    }

    function recognizedBackingValue(bytes32 identityId) external view returns (uint256) {
        BackingIdentity storage identity = identities[identityId];
        if (!identity.exists || identity.backingClass != BackingClass.RecognizedReserveBacking) {
            return 0;
        }
        return identity.value;
    }
}
