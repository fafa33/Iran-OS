// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SovereignCrawler
 * @dev خزنده شبکه — بازپس‌گیری دارایی‌های غصبی
 * - شناسایی، ردیابی و انجماد ظرف ۷۲ ساعت
 * - تحلیل گراف تراکنش‌ها برای کشف Shell Companies
 * - غیرمتمرکز — روی نودهای نخبگانی اجرا می‌شود
 * فرمول: V(L1) = Σ(C + G + A)
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract SovereignCrawler is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE  = keccak256("KERNEL_ROLE");
    bytes32 public constant NODE_ROLE    = keccak256("NODE_ROLE");
    bytes32 public constant COUNCIL_ROLE = keccak256("COUNCIL_ROLE");

    uint256 public constant FREEZE_DEADLINE = 72 hours;
    uint256 public constant NODE_THRESHOLD  = 3;

    enum TargetType   { Cartel, ParastatalEntity, ShellCompany, PersonalAccount }
    enum CrawlStatus  { Identified, Tracking, Frozen, Confirmed, Transferred, Released }

    struct CrawlTarget {
        bytes32    targetId;
        address    targetAddress;
        TargetType targetType;
        string     entityName;
        uint256    estimatedValue;
        CrawlStatus status;
        uint256    identifiedAt;
        uint256    frozenAt;
        uint256    nodeConfirmations;
        bytes32    parentTarget;
        bool       isShellCompany;
    }

    struct GraphEdge {
        bytes32 from;
        bytes32 to;
        uint256 transferAmount;
        uint256 transferTime;
        string  edgeType;
    }

    mapping(bytes32 => CrawlTarget)  public targets;
    mapping(bytes32 => bool)          public nodeConfirmed;
    mapping(uint256 => GraphEdge)     public graphEdges;
    mapping(bytes32 => bytes32[])     public shellCompanyChain;

    bytes32[] public allTargetIds;
    uint256   public edgeCount;
    uint256   public totalFrozenValue;
    uint256   public totalTransferredValue;
    address   public swfTempWallet;

    event TargetIdentified(bytes32 indexed targetId, address targetAddress, TargetType targetType, uint256 estimatedValue);
    event AssetFrozen(bytes32 indexed targetId, uint256 frozenAt, uint256 value);
    event NodeConfirmed(bytes32 indexed targetId, address node, uint256 confirmationCount);
    event AssetConfirmedByCouncil(bytes32 indexed targetId, uint256 timestamp);
    event AssetTransferredToSWF(bytes32 indexed targetId, uint256 value, uint256 timestamp);
    event AssetReleased(bytes32 indexed targetId, string reason);
    event GraphEdgeAdded(uint256 indexed edgeId, bytes32 from, bytes32 to, uint256 amount);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel, address _swfTempWallet) {
        require(_admin != address(0), "SovereignCrawler: invalid admin");
        require(_kernel != address(0), "SovereignCrawler: invalid kernel");
        require(_swfTempWallet != address(0), "SovereignCrawler: invalid SWF");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        swfTempWallet = _swfTempWallet;
    }

    function identifyTarget(bytes32 targetId, address targetAddress, TargetType targetType, string calldata entityName, uint256 estimatedValue, bytes32 parentTarget, bool isShellCompany) external onlyRole(NODE_ROLE) nonReentrant returns (bool isNew) {
        require(targetId != bytes32(0), "SovereignCrawler: invalid id");
        require(targetAddress != address(0), "SovereignCrawler: invalid address");
        require(estimatedValue > 0, "SovereignCrawler: zero value");
        if (targets[targetId].identifiedAt > 0) {
            bytes32 key = keccak256(abi.encodePacked(targetId, msg.sender));
            require(!nodeConfirmed[key], "SovereignCrawler: confirmed");
            nodeConfirmed[key] = true;
            targets[targetId].nodeConfirmations++;
            emit NodeConfirmed(targetId, msg.sender, targets[targetId].nodeConfirmations);
            return false;
        }
        targets[targetId] = CrawlTarget({ targetId: targetId, targetAddress: targetAddress, targetType: targetType, entityName: entityName, estimatedValue: estimatedValue, status: CrawlStatus.Identified, identifiedAt: block.timestamp, frozenAt: 0, nodeConfirmations: 1, parentTarget: parentTarget, isShellCompany: isShellCompany });
        allTargetIds.push(targetId);
        totalFrozenValue += estimatedValue;
        if (isShellCompany && parentTarget != bytes32(0)) shellCompanyChain[parentTarget].push(targetId);
        emit TargetIdentified(targetId, targetAddress, targetType, estimatedValue);
        return true;
    }

    function addGraphEdge(bytes32 from, bytes32 to, uint256 transferAmount, uint256 transferTime, string calldata edgeType) external onlyRole(NODE_ROLE) nonReentrant {
        edgeCount++;
        graphEdges[edgeCount] = GraphEdge({ from: from, to: to, transferAmount: transferAmount, transferTime: transferTime, edgeType: edgeType });
        emit GraphEdgeAdded(edgeCount, from, to, transferAmount);
    }

    function freezeTarget(bytes32 targetId) external onlyRole(NODE_ROLE) nonReentrant {
        CrawlTarget storage target = targets[targetId];
        require(target.identifiedAt > 0, "SovereignCrawler: not found");
        require(target.status == CrawlStatus.Identified || target.status == CrawlStatus.Tracking, "SovereignCrawler: wrong status");
        require(block.timestamp >= target.identifiedAt + FREEZE_DEADLINE || target.nodeConfirmations >= NODE_THRESHOLD, "SovereignCrawler: too early");
        target.status = CrawlStatus.Frozen;
        target.frozenAt = block.timestamp;
        emit AssetFrozen(targetId, block.timestamp, target.estimatedValue);
    }

    function confirmByCouncil(bytes32 targetId) external onlyRole(COUNCIL_ROLE) nonReentrant {
        require(targets[targetId].status == CrawlStatus.Frozen, "SovereignCrawler: not frozen");
        targets[targetId].status = CrawlStatus.Confirmed;
        emit AssetConfirmedByCouncil(targetId, block.timestamp);
    }

    function transferToSWF(bytes32 targetId) external onlyRole(COUNCIL_ROLE) nonReentrant {
        require(targets[targetId].status == CrawlStatus.Confirmed, "SovereignCrawler: not confirmed");
        targets[targetId].status = CrawlStatus.Transferred;
        totalTransferredValue += targets[targetId].estimatedValue;
        emit AssetTransferredToSWF(targetId, targets[targetId].estimatedValue, block.timestamp);
    }

    function releaseTarget(bytes32 targetId, string calldata reason) external onlyRole(KERNEL_ROLE) nonReentrant {
        require(targets[targetId].status != CrawlStatus.Transferred, "SovereignCrawler: transferred");
        totalFrozenValue -= targets[targetId].estimatedValue;
        targets[targetId].status = CrawlStatus.Released;
        emit AssetReleased(targetId, reason);
    }

    function getTarget(bytes32 targetId) external view returns (CrawlTarget memory) { return targets[targetId]; }
    function getShellChain(bytes32 rootTarget) external view returns (bytes32[] memory) { return shellCompanyChain[rootTarget]; }
    function getTotalTargets() external view returns (uint256) { return allTargetIds.length; }
}