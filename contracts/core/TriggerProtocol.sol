// SPDX-License-Identifier: LicenseRef-IranOS-Source-Available-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ITreasury {
    function blockAddressByTrigger(address target) external;
}

/**
 * @title TriggerProtocol
 * @dev پروتکل ماشه — لایه اجرایی مکانیسم برخورد خودکار با تخلف از منشور
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract TriggerProtocol is ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE = keccak256("KERNEL_ROLE");

    uint256 public constant INTERIM_REPLACEMENT_DELAY = 24 hours;

    address public kernel;
    address public treasury;
    address public swf;
    uint256 public executionCount;

    struct TriggerExecution {
        uint256 violationId;
        address offender;
        uint8   violationCode;
        uint256 executedAt;
        bool    treasuryBlocked;
        bool    signatureRevoked;
        bool    publicNotified;
        address interimReplacement;
    }

    mapping(uint256 => TriggerExecution) public executions;
    mapping(address => bool) public blockedFromTreasury;
    mapping(address => bool) public signatureRevoked;
    mapping(address => address) public interimReplacements;

    event TriggerExecuted(uint256 indexed executionId, uint256 indexed violationId, address indexed offender, uint8 violationCode, uint256 timestamp);
    event TreasuryAccessBlocked(address indexed offender, uint256 timestamp);
    event SignatureRevoked(address indexed offender, uint256 timestamp);
    event PublicNotification(uint256 indexed executionId, address indexed offender, uint8 violationCode, string message, uint256 timestamp);
    event InterimReplacementActivated(address indexed offender, address indexed replacement, uint256 timestamp);

    modifier onlyKernel() {
        require(msg.sender == kernel, "TriggerProtocol: caller is not the Kernel");
        _;
    }

    constructor(address _kernel, address _treasury, address _swf) {
        require(_kernel   != address(0), "TriggerProtocol: invalid kernel");
        require(_treasury != address(0), "TriggerProtocol: invalid treasury");
        require(_swf      != address(0), "TriggerProtocol: invalid SWF");
        kernel   = _kernel;
        treasury = _treasury;
        swf      = _swf;
    }

    function executeTrigger(uint256 violationId, address offender, uint8 violationCode, address replacement) external onlyKernel nonReentrant returns (uint256 executionId) {
        require(offender != address(0), "TriggerProtocol: invalid offender");
        executionCount++;
        executionId = executionCount;
        blockedFromTreasury[offender] = true;
        ITreasury(treasury).blockAddressByTrigger(offender);
        emit TreasuryAccessBlocked(offender, block.timestamp);
        signatureRevoked[offender] = true;
        emit SignatureRevoked(offender, block.timestamp);
        emit PublicNotification(executionId, offender, violationCode, "TRIGGER_ACTIVATED: Constitutional violation detected.", block.timestamp);
        address interim = address(0);
        if (replacement != address(0)) {
            interimReplacements[offender] = replacement;
            interim = replacement;
            emit InterimReplacementActivated(offender, replacement, block.timestamp);
        }
        executions[executionId] = TriggerExecution({ violationId: violationId, offender: offender, violationCode: violationCode, executedAt: block.timestamp, treasuryBlocked: true, signatureRevoked: true, publicNotified: true, interimReplacement: interim });
        emit TriggerExecuted(executionId, violationId, offender, violationCode, block.timestamp);
        return executionId;
    }

    function isTreasuryBlocked(address official) external view returns (bool) { return blockedFromTreasury[official]; }
    function isSignatureRevoked(address official) external view returns (bool) { return signatureRevoked[official]; }
    function getInterimReplacement(address official) external view returns (address) { return interimReplacements[official]; }
}
