// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IIranOSKernel {
    function flagViolation(uint8 violationCode, address offender, string calldata reason) external returns (uint256 violationId);
}

/**
 * @title API3Oracle
 * @dev اوراکل اصلی ایران‌اواس — اتصال داده‌های واقعی به قراردادهای هوشمند
 * نسخه ۱.۰ — فروردین ۲۵۸۵ شاهنشاهی
 */
contract API3Oracle is AccessControl, ReentrancyGuard {

    bytes32 public constant FEEDER_ROLE   = keccak256("FEEDER_ROLE");
    bytes32 public constant KERNEL_ROLE   = keccak256("KERNEL_ROLE");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");

    uint8 public constant DATA_PRICE      = 1;
    uint8 public constant DATA_PRODUCTION = 2;
    uint8 public constant DATA_GOVERNANCE = 3;
    uint8 public constant DATA_JUDICIAL   = 4;
    uint8 public constant DATA_MILITARY   = 5;
    uint8 public constant DATA_WELFARE    = 6;

    uint256 public constant MAX_DATA_AGE = 1 hours;

    struct DataPoint {
        uint8   dataType;
        bytes32 key;
        int256  value;
        uint256 timestamp;
        address feeder;
        bool    isValid;
        uint256 confidence;
    }

    struct ViolationFlag {
        address offender;
        uint8   violationCode;
        string  reason;
        uint256 timestamp;
        bool    confirmed;
    }

    mapping(bytes32 => DataPoint)     public dataPoints;
    mapping(uint256 => ViolationFlag) public violationFlags;
    uint256 public violationFlagCount;

    bytes32 public constant PAH_USD_KEY   = keccak256("PAH_USD_RATE");
    bytes32 public constant INFLATION_KEY = keccak256("GLOBAL_INFLATION");

    address public kernel;

    event DataUpdated(bytes32 indexed key, int256 value, uint256 timestamp, address feeder);
    event ViolationFlagged(uint256 indexed flagId, address indexed offender, uint8 violationCode);
    event ViolationConfirmed(uint256 indexed flagId, address indexed offender);

    modifier onlyFeeder() {
        require(hasRole(FEEDER_ROLE, msg.sender), "API3Oracle: caller is not a feeder");
        _;
    }

    constructor(address _kernel) {
        require(_kernel != address(0), "API3Oracle: invalid kernel");
        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(KERNEL_ROLE, _kernel);
        kernel = _kernel;
        dataPoints[PAH_USD_KEY] = DataPoint({ dataType: DATA_PRICE, key: PAH_USD_KEY, value: 1 * int256(1e18), timestamp: block.timestamp, feeder: msg.sender, isValid: true, confidence: 1000 });
    }

    function updateData(bytes32 key, uint8 dataType, int256 value, uint256 confidence) external onlyFeeder nonReentrant {
        require(key != bytes32(0), "API3Oracle: invalid key");
        require(dataType >= 1 && dataType <= 6, "API3Oracle: invalid data type");
        require(confidence <= 1000, "API3Oracle: invalid confidence");
        if (dataType == DATA_MILITARY) {
            require(hasRole(KERNEL_ROLE, msg.sender), "API3Oracle: military data restricted");
        }
        dataPoints[key] = DataPoint({ dataType: dataType, key: key, value: value, timestamp: block.timestamp, feeder: msg.sender, isValid: true, confidence: confidence });
        emit DataUpdated(key, value, block.timestamp, msg.sender);
    }

    function flagViolation(address offender, uint8 violationCode, string calldata reason) external onlyFeeder nonReentrant returns (uint256 flagId) {
        require(offender != address(0), "API3Oracle: invalid offender");
        require(violationCode >= 1 && violationCode <= 6, "API3Oracle: invalid code");
        require(
            block.timestamp - dataPoints[PAH_USD_KEY].timestamp <= MAX_DATA_AGE,
            "API3Oracle: stale data feed"
        );
        violationFlagCount++;
        flagId = violationFlagCount;
        violationFlags[flagId] = ViolationFlag({ offender: offender, violationCode: violationCode, reason: reason, timestamp: block.timestamp, confirmed: false });
        emit ViolationFlagged(flagId, offender, violationCode);
        IIranOSKernel(kernel).flagViolation(violationCode, offender, reason);
        return flagId;
    }

    function confirmViolation(uint256 flagId) external onlyRole(KERNEL_ROLE) nonReentrant {
        ViolationFlag storage flag = violationFlags[flagId];
        require(flag.timestamp > 0, "API3Oracle: flag not found");
        require(!flag.confirmed, "API3Oracle: already confirmed");
        flag.confirmed = true;
        emit ViolationConfirmed(flagId, flag.offender);
    }

    function getData(bytes32 key) external view returns (int256 value, uint256 timestamp, bool isValid) {
        DataPoint storage dp = dataPoints[key];
        return (dp.value, dp.timestamp, dp.isValid);
    }

    function getDataWithConfidence(bytes32 key) external view returns (
        int256  value,
        uint256 timestamp,
        bool    isValid,
        uint256 confidence,
        address feeder
    ) {
        DataPoint storage dp = dataPoints[key];
        return (dp.value, dp.timestamp, dp.isValid, dp.confidence, dp.feeder);
    }

    function getViolationFlag(uint256 flagId) external view returns (ViolationFlag memory) {
        require(violationFlags[flagId].timestamp > 0, "API3Oracle: flag not found");
        return violationFlags[flagId];
    }
}
