// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ISovereignWealthFund {
    function receiveReclaimedAsset(uint256 amount, string calldata assetId) external;
}

/**
 * @title AssetFreeze
 * @dev انجماد آنی دارایی‌های غصبی — پروتکل بازپس‌گیری
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract AssetFreeze is AccessControl, ReentrancyGuard {

    bytes32 public constant CRAWLER_ROLE = keccak256("CRAWLER_ROLE");
    bytes32 public constant COUNCIL_ROLE = keccak256("COUNCIL_ROLE");
    bytes32 public constant KERNEL_ROLE  = keccak256("KERNEL_ROLE");

    enum FreezeStatus { Active, UnderReview, Confirmed, Released }

    struct FrozenAsset {
        address      originalOwner;
        string       assetType;
        uint256      estimatedValue;
        uint256      frozenAt;
        FreezeStatus status;
        string       reason;
        uint8        councilSignatures;
        bool         transferredToSWF;
    }

    mapping(bytes32 => FrozenAsset) public frozenAssets;
    mapping(bytes32 => mapping(address => bool)) public councilSigns;

    bytes32[] public frozenAssetIds;
    uint256   public totalFrozenValue;
    address   public swfTempWallet;  // کیف‌پول موقت — نگهداری دارایی در مرحله ۲ (۲۴–۴۸ ساعت)
    address   public swfContract;    // قرارداد صندوق ثروت ملی — انتقال دائم در مرحله ۴
    uint8     public constant COUNCIL_THRESHOLD = 3;

    event AssetFrozen(bytes32 indexed assetId, address indexed owner, uint256 value, uint256 timestamp);
    event AssetReviewStarted(bytes32 indexed assetId, uint256 timestamp);
    event AssetConfirmed(bytes32 indexed assetId, uint256 timestamp);
    event AssetReleased(bytes32 indexed assetId, string reason, uint256 timestamp);
    event AssetTransferredToSWF(bytes32 indexed assetId, uint256 value, uint256 timestamp);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring is reachable on mainnet); _kernel continues
    // to receive only KERNEL_ROLE. Mirrors SovereignWealthFund.sol's
    // constructor(sovereign, kernel) split — see CHANGELOG "P0 deployment-path
    // parity" for the originating finding on Treasury/VictimFund/etc.
    constructor(address _admin, address _kernel, address _swfTempWallet, address _swfContract) {
        require(_admin       != address(0), "AssetFreeze: invalid admin");
        require(_kernel      != address(0), "AssetFreeze: invalid kernel");
        require(_swfTempWallet != address(0), "AssetFreeze: invalid SWF wallet");
        require(_swfContract != address(0), "AssetFreeze: invalid SWF contract");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        swfTempWallet = _swfTempWallet;
        swfContract   = _swfContract;
    }

    function freezeAsset(bytes32 assetId, address originalOwner, string calldata assetType, uint256 estimatedValue, string calldata reason) external onlyRole(CRAWLER_ROLE) nonReentrant {
        require(assetId != bytes32(0), "AssetFreeze: invalid id");
        require(frozenAssets[assetId].frozenAt == 0, "AssetFreeze: already frozen");
        require(originalOwner != address(0), "AssetFreeze: invalid owner");
        require(estimatedValue > 0, "AssetFreeze: zero value");
        frozenAssets[assetId] = FrozenAsset({ originalOwner: originalOwner, assetType: assetType, estimatedValue: estimatedValue, frozenAt: block.timestamp, status: FreezeStatus.Active, reason: reason, councilSignatures: 0, transferredToSWF: false });
        frozenAssetIds.push(assetId);
        totalFrozenValue += estimatedValue;
        emit AssetFrozen(assetId, originalOwner, estimatedValue, block.timestamp);
    }

    function signConfirmation(bytes32 assetId) external onlyRole(COUNCIL_ROLE) nonReentrant {
        FrozenAsset storage asset = frozenAssets[assetId];
        require(asset.frozenAt > 0, "AssetFreeze: not found");
        require(asset.status == FreezeStatus.Active || asset.status == FreezeStatus.UnderReview, "AssetFreeze: invalid status");
        require(!councilSigns[assetId][msg.sender], "AssetFreeze: already signed");
        councilSigns[assetId][msg.sender] = true;
        asset.councilSignatures++;
        if (asset.status == FreezeStatus.Active) {
            asset.status = FreezeStatus.UnderReview;
            emit AssetReviewStarted(assetId, block.timestamp);
        }
        if (asset.councilSignatures >= COUNCIL_THRESHOLD) {
            asset.status = FreezeStatus.Confirmed;
            emit AssetConfirmed(assetId, block.timestamp);
        }
    }

    function transferToSWF(bytes32 assetId) external onlyRole(COUNCIL_ROLE) nonReentrant {
        FrozenAsset storage asset = frozenAssets[assetId];
        require(asset.status == FreezeStatus.Confirmed, "AssetFreeze: not confirmed");
        require(!asset.transferredToSWF, "AssetFreeze: already transferred");

        // اثرات پیش از برهم‌کنش (CEI) — اگر فراخوانی SWF ناموفق باشد، کل تراکنش برمی‌گردد
        asset.transferredToSWF  = true;
        totalFrozenValue        -= asset.estimatedValue;

        // برهم‌کنش: ثبت حسابداری در لایه نقد (L1) صندوق ثروت ملی
        // هیچ توکن PAH ضرب نمی‌شود — صرفاً به‌روزرسانی ترازنامه دارایی است
        ISovereignWealthFund(swfContract).receiveReclaimedAsset(
            asset.estimatedValue,
            unicode"بازپس‌گیری"
        );

        emit AssetTransferredToSWF(assetId, asset.estimatedValue, block.timestamp);
    }

    function releaseAsset(bytes32 assetId, string calldata reason) external onlyRole(KERNEL_ROLE) nonReentrant {
        FrozenAsset storage asset = frozenAssets[assetId];
        require(asset.frozenAt > 0, "AssetFreeze: not found");
        require(!asset.transferredToSWF, "AssetFreeze: already transferred");
        totalFrozenValue -= asset.estimatedValue;
        asset.status = FreezeStatus.Released;
        emit AssetReleased(assetId, reason, block.timestamp);
    }

    function totalFrozenAssets() external view returns (uint256) { return frozenAssetIds.length; }
    function getFrozenAsset(bytes32 assetId) external view returns (FrozenAsset memory) { return frozenAssets[assetId]; }
}
