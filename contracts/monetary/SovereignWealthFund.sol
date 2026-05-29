// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SovereignWealthFund
 * @dev صندوق ثروت ملی ایران — مدیریت سه لایه دارایی
 * L1: ۳۰۰ میلیارد دلار نقد | L2: ۳۰۰ میلیارد مولد | L3: ۲ تریلیون گرو
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract SovereignWealthFund is AccessControl, ReentrancyGuard {

    bytes32 public constant SOVEREIGN_ROLE = keccak256("SOVEREIGN_ROLE");
    bytes32 public constant COUNCIL_ROLE   = keccak256("COUNCIL_ROLE");
    bytes32 public constant KERNEL_ROLE    = keccak256("KERNEL_ROLE");
    bytes32 public constant RECLAIM_ROLE   = keccak256("RECLAIM_ROLE");

    uint256 public constant L1_TARGET    = 300_000_000_000 * 1e18;
    uint256 public constant L2_TARGET    = 300_000_000_000 * 1e18;
    uint256 public constant L3_TARGET    = 2_000_000_000_000 * 1e18;
    uint256 public constant ANNUAL_YIELD = 150;
    uint256 public constant MULTISIG_REQUIRED = 3;

    struct AssetLayer {
        uint256 balance;
        uint256 target;
        uint256 lastUpdated;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
    }

    struct Transaction {
        address initiator;
        uint8   layer;
        uint256 amount;
        string  purpose;
        uint256 timestamp;
        uint8   signaturesCount;
        bool    executed;
    }

    AssetLayer public layerL1;
    AssetLayer public layerL2;
    AssetLayer public layerL3;

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public txSignatures;
    uint256 public txCount;

    address public nationalTreasury;

    event DepositToL1(uint256 amount, string source, uint256 newBalance);
    event DepositToL2(uint256 amount, string asset, uint256 newBalance);
    event DepositToL3(uint256 amount, string asset, uint256 newBalance);
    event WithdrawalProposed(uint256 indexed txId, uint8 layer, uint256 amount, string purpose);
    event WithdrawalSigned(uint256 indexed txId, address signer, uint8 sigCount);
    event WithdrawalExecuted(uint256 indexed txId, uint8 layer, uint256 amount);
    event AnnualYieldDistributed(uint256 yieldAmount, uint256 timestamp);

    constructor(address _sovereign, address _kernel) {
        require(_sovereign != address(0), "SWF: invalid sovereign");
        require(_kernel    != address(0), "SWF: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _sovereign);
        _grantRole(SOVEREIGN_ROLE, _sovereign);
        _grantRole(KERNEL_ROLE, _kernel);
        layerL1 = AssetLayer(0, L1_TARGET, block.timestamp, 0, 0);
        layerL2 = AssetLayer(0, L2_TARGET, block.timestamp, 0, 0);
        layerL3 = AssetLayer(0, L3_TARGET, block.timestamp, 0, 0);
    }

    function depositToL1(uint256 amount, string calldata source) external onlyRole(COUNCIL_ROLE) nonReentrant {
        require(amount > 0, "SWF: zero amount");
        layerL1.balance += amount; layerL1.totalDeposited += amount; layerL1.lastUpdated = block.timestamp;
        emit DepositToL1(amount, source, layerL1.balance);
    }

    function depositToL2(uint256 amount, string calldata asset) external onlyRole(COUNCIL_ROLE) nonReentrant {
        require(amount > 0, "SWF: zero amount");
        layerL2.balance += amount; layerL2.totalDeposited += amount; layerL2.lastUpdated = block.timestamp;
        emit DepositToL2(amount, asset, layerL2.balance);
    }

    function depositToL3(uint256 amount, string calldata asset) external onlyRole(COUNCIL_ROLE) nonReentrant {
        require(amount > 0, "SWF: zero amount");
        layerL3.balance += amount; layerL3.totalDeposited += amount; layerL3.lastUpdated = block.timestamp;
        emit DepositToL3(amount, asset, layerL3.balance);
    }

    function proposeWithdrawal(uint8 layer, uint256 amount, string calldata purpose) external onlyRole(COUNCIL_ROLE) nonReentrant returns (uint256 txId) {
        require(layer >= 1 && layer <= 3, "SWF: invalid layer");
        require(amount > 0, "SWF: zero amount");
        txCount++; txId = txCount;
        transactions[txId] = Transaction({ initiator: msg.sender, layer: layer, amount: amount, purpose: purpose, timestamp: block.timestamp, signaturesCount: 1, executed: false });
        txSignatures[txId][msg.sender] = true;
        emit WithdrawalProposed(txId, layer, amount, purpose);
        return txId;
    }

    function signWithdrawal(uint256 txId) external onlyRole(COUNCIL_ROLE) nonReentrant {
        Transaction storage tx_ = transactions[txId];
        require(tx_.timestamp > 0, "SWF: tx not found");
        require(!tx_.executed, "SWF: already executed");
        require(!txSignatures[txId][msg.sender], "SWF: already signed");
        txSignatures[txId][msg.sender] = true;
        tx_.signaturesCount++;
        emit WithdrawalSigned(txId, msg.sender, tx_.signaturesCount);
        if (tx_.signaturesCount >= MULTISIG_REQUIRED) {
            tx_.executed = true;
            if (tx_.layer == 1) { require(layerL1.balance >= tx_.amount, "SWF: insufficient L1"); layerL1.balance -= tx_.amount; layerL1.totalWithdrawn += tx_.amount; }
            else if (tx_.layer == 2) { require(layerL2.balance >= tx_.amount, "SWF: insufficient L2"); layerL2.balance -= tx_.amount; layerL2.totalWithdrawn += tx_.amount; }
            else { require(layerL3.balance >= tx_.amount, "SWF: insufficient L3"); layerL3.balance -= tx_.amount; layerL3.totalWithdrawn += tx_.amount; }
            emit WithdrawalExecuted(txId, tx_.layer, tx_.amount);
        }
    }

    function distributeAnnualYield() external onlyRole(COUNCIL_ROLE) nonReentrant {
        uint256 yield = (layerL2.balance * ANNUAL_YIELD) / 1000;
        require(yield > 0, "SWF: no yield");
        require(layerL2.balance >= yield, "SWF: insufficient L2");
        layerL2.balance -= yield; layerL2.totalWithdrawn += yield; layerL1.balance += yield; layerL1.totalDeposited += yield;
        emit AnnualYieldDistributed(yield, block.timestamp);
    }

    /**
     * @notice دریافت دارایی بازپس‌گرفته و ثبت در لایه نقد (L1)
     * @dev تنها قرارداد AssetFreeze با نقش RECLAIM_ROLE مجاز به فراخوانی است.
     *      این تابع صرفاً حسابداری است — هیچ توکن PAH ضرب نمی‌شود.
     * @param amount ارزش دلاری دارایی (در واحد 1e18) — همان estimatedValue در AssetFreeze
     * @param assetId شناسه دارایی (برای ردیابی در رویداد DepositToL1)
     */
    function receiveReclaimedAsset(uint256 amount, string calldata assetId)
        external
        onlyRole(RECLAIM_ROLE)
        nonReentrant
    {
        require(amount > 0, "SWF: zero amount");
        layerL1.balance       += amount;
        layerL1.totalDeposited += amount;
        layerL1.lastUpdated    = block.timestamp;
        emit DepositToL1(amount, assetId, layerL1.balance);
    }

    function totalAssets() external view returns (uint256) { return layerL1.balance + layerL2.balance + layerL3.balance; }
    function projectedAnnualYield() external view returns (uint256) { return (layerL2.balance * ANNUAL_YIELD) / 1000; }
    function layerFillRatio(uint8 layer) external view returns (uint256) {
        if (layer == 1) return layerL1.target > 0 ? (layerL1.balance * 1000) / layerL1.target : 0;
        if (layer == 2) return layerL2.target > 0 ? (layerL2.balance * 1000) / layerL2.target : 0;
        if (layer == 3) return layerL3.target > 0 ? (layerL3.balance * 1000) / layerL3.target : 0;
        return 0;
    }
}
