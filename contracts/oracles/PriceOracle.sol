// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PriceOracle
 * @dev اوراکل قیمت‌های جهانی — تثبیت ارزش پهلوی
 * - نرخ پهلوی به دلار (۱ پهلوی = ۱ دلار هدف)
 * - شاخص تورم جهانی برای تنظیم مستمری‌ها
 * - قیمت نفت، گاز و معادن برای ارزیابی لایه L3 صندوق
 * - داده‌ها از حداقل ۳ منبع مستقل
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract PriceOracle is AccessControl, ReentrancyGuard {

    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant FEEDER_ROLE   = keccak256("FEEDER_ROLE");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");

    uint256 public constant STALENESS_THRESHOLD = 1 hours;
    uint256 public constant MIN_FEEDERS         = 3;
    uint256 public constant DEVIATION_THRESHOLD = 50;

    bytes32 public constant KEY_PAH_USD   = keccak256("PAH_USD");
    bytes32 public constant KEY_USD_GOLD  = keccak256("USD_GOLD");
    bytes32 public constant KEY_OIL_USD   = keccak256("OIL_USD");
    bytes32 public constant KEY_GAS_USD   = keccak256("GAS_USD");
    bytes32 public constant KEY_INFLATION = keccak256("GLOBAL_CPI");
    bytes32 public constant KEY_L2_YIELD  = keccak256("L2_YIELD_RATE");

    struct PriceData {
        int256  value;
        uint256 timestamp;
        uint256 confidence;
        uint8   feederCount;
        bool    isValid;
    }

    struct FeederSubmission {
        address feeder;
        int256  value;
        uint256 timestamp;
        bool    counted;
    }

    mapping(bytes32 => PriceData)                              public prices;
    mapping(bytes32 => mapping(address => FeederSubmission))   public submissions;
    mapping(bytes32 => address[])                              public dataFeeders;

    event PriceUpdated(bytes32 indexed key, int256 value, uint256 timestamp, uint8 feederCount);
    event FeederSubmitted(bytes32 indexed key, address feeder, int256 value);
    event PriceInvalidated(bytes32 indexed key, string reason);
    event DeviationDetected(bytes32 indexed key, int256 existing, int256 submitted, uint256 deviation);

    // _admin receives DEFAULT_ADMIN_ROLE (real signer — e.g. the Sovereign —
    // so post-deploy role wiring, such as granting FEEDER_ROLE, is reachable
    // on mainnet). _kernel receives only KERNEL_ROLE, recording the Kernel
    // contract's identity without relying on it to ever originate a
    // transaction here (Kernel has no call-forwarding mechanism to this
    // contract, so invalidatePrice() would otherwise be permanently
    // unreachable). Mirrors SovereignWealthFund.sol's constructor(sovereign,
    // kernel) split — see CHANGELOG "P0 deployment-path parity" for the
    // originating finding on VictimFund/JurySelection/JusticeProtocol/
    // CitizenCard/ConstitutionGuard.
    constructor(address _admin, address _kernel) {
        require(_admin != address(0), "PriceOracle: invalid admin");
        require(_kernel != address(0), "PriceOracle: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(KERNEL_ROLE, _kernel);
        prices[KEY_PAH_USD] = PriceData({ value: 1 * int256(1e18), timestamp: block.timestamp, confidence: 1000, feederCount: 1, isValid: true });
    }

    function submitPrice(bytes32 key, int256 value, uint256 confidence) external onlyRole(FEEDER_ROLE) nonReentrant {
        require(key != bytes32(0), "PriceOracle: invalid key");
        require(value > 0,         "PriceOracle: invalid value");
        require(confidence <= 1000, "PriceOracle: invalid confidence");
        if (prices[key].isValid && prices[key].value > 0) {
            int256 existing = prices[key].value;
            int256 diff = value > existing ? value - existing : existing - value;
            uint256 deviation = uint256((diff * 1000) / existing);
            if (deviation > DEVIATION_THRESHOLD) emit DeviationDetected(key, existing, value, deviation);
        }
        submissions[key][msg.sender] = FeederSubmission({ feeder: msg.sender, value: value, timestamp: block.timestamp, counted: true });
        bool alreadyRegistered = false;
        for (uint256 i = 0; i < dataFeeders[key].length; i++) {
            if (dataFeeders[key][i] == msg.sender) { alreadyRegistered = true; break; }
        }
        if (!alreadyRegistered) dataFeeders[key].push(msg.sender);
        emit FeederSubmitted(key, msg.sender, value);
        _updateAggregatedPrice(key, confidence);
    }

    function _updateAggregatedPrice(bytes32 key, uint256 confidence) internal {
        address[] storage feeders = dataFeeders[key];
        if (feeders.length < MIN_FEEDERS) return;
        int256 sumValues = 0;
        uint8  validCount = 0;
        for (uint256 i = 0; i < feeders.length; i++) {
            FeederSubmission storage sub = submissions[key][feeders[i]];
            if (sub.counted && block.timestamp - sub.timestamp <= STALENESS_THRESHOLD) {
                sumValues += sub.value;
                validCount++;
            }
        }
        if (validCount >= MIN_FEEDERS) {
            prices[key] = PriceData({ value: sumValues / int256(uint256(validCount)), timestamp: block.timestamp, confidence: confidence, feederCount: validCount, isValid: true });
            emit PriceUpdated(key, prices[key].value, block.timestamp, validCount);
        }
    }

    function invalidatePrice(bytes32 key, string calldata reason) external onlyRole(KERNEL_ROLE) {
        prices[key].isValid = false;
        emit PriceInvalidated(key, reason);
    }

    function getPrice(bytes32 key) external view returns (int256 value, uint256 timestamp, bool isValid) {
        PriceData storage p = prices[key];
        return (p.value, p.timestamp, p.isValid);
    }
    function getPahlaviUSDRate() external view returns (int256) { return prices[KEY_PAH_USD].value; }
    function getOilPrice() external view returns (int256) { return prices[KEY_OIL_USD].value; }
    function getGoldPrice() external view returns (int256) { return prices[KEY_USD_GOLD].value; }
    function getInflationRate() external view returns (int256) { return prices[KEY_INFLATION].value; }
    function getL2YieldRate() external view returns (int256) { return prices[KEY_L2_YIELD].value; }
    function isDataFresh(bytes32 key) external view returns (bool) {
        return prices[key].isValid && block.timestamp - prices[key].timestamp <= STALENESS_THRESHOLD;
    }
}