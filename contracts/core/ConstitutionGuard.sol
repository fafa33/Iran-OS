// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ConstitutionGuard
 * @dev نگهبان قانون اساسی — تطبیق‌دهنده تمام مصوبات با اصول منشور
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract ConstitutionGuard {

    address public kernel;

    uint8 public constant PRINCIPLE_SECULAR     = 1;
    uint8 public constant PRINCIPLE_RIGHTS      = 2;
    uint8 public constant PRINCIPLE_TERRITORIAL = 3;
    uint8 public constant PRINCIPLE_MONETARY    = 4;
    uint8 public constant PRINCIPLE_JUDICIAL    = 5;

    struct LawProposal {
        bytes32 hash;
        address proposer;
        uint256 proposedAt;
        bool    isCompliant;
        string  rejectionReason;
        bool    executed;
    }

    mapping(bytes32 => LawProposal) public proposals;
    mapping(bytes32 => bool) public approvedLaws;

    event LawProposed(bytes32 indexed hash, address indexed proposer, uint256 timestamp);
    event LawApproved(bytes32 indexed hash, uint256 timestamp);
    event LawRejected(bytes32 indexed hash, string reason, uint256 timestamp);

    modifier onlyKernel() {
        require(msg.sender == kernel, "ConstitutionGuard: caller is not the Kernel");
        _;
    }

    constructor(address _kernel) {
        require(_kernel != address(0), "ConstitutionGuard: invalid kernel");
        kernel = _kernel;
    }

    function proposeLaw(bytes32 lawHash) external returns (bool) {
        require(lawHash != bytes32(0), "ConstitutionGuard: invalid hash");
        require(proposals[lawHash].proposedAt == 0, "ConstitutionGuard: already proposed");
        proposals[lawHash] = LawProposal({ hash: lawHash, proposer: msg.sender, proposedAt: block.timestamp, isCompliant: false, rejectionReason: "", executed: false });
        emit LawProposed(lawHash, msg.sender, block.timestamp);
        return true;
    }

    function approveLaw(bytes32 lawHash) external onlyKernel {
        LawProposal storage proposal = proposals[lawHash];
        require(proposal.proposedAt > 0, "ConstitutionGuard: proposal not found");
        require(!proposal.executed, "ConstitutionGuard: already executed");
        proposal.isCompliant = true;
        proposal.executed = true;
        approvedLaws[lawHash] = true;
        emit LawApproved(lawHash, block.timestamp);
    }

    function rejectLaw(bytes32 lawHash, string calldata reason) external onlyKernel {
        LawProposal storage proposal = proposals[lawHash];
        require(proposal.proposedAt > 0, "ConstitutionGuard: proposal not found");
        require(!proposal.executed, "ConstitutionGuard: already executed");
        proposal.isCompliant = false;
        proposal.rejectionReason = reason;
        proposal.executed = true;
        approvedLaws[lawHash] = false;
        emit LawRejected(lawHash, reason, block.timestamp);
    }

    function isLawApproved(bytes32 lawHash) external view returns (bool) { return approvedLaws[lawHash]; }
    function getProposal(bytes32 lawHash) external view returns (LawProposal memory) {
        require(proposals[lawHash].proposedAt > 0, "ConstitutionGuard: not found");
        return proposals[lawHash];
    }
}
