// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IFargard7PriceOracle {
    function getPrice(bytes32 key) external view returns (int256 value, uint256 timestamp, bool isValid);
    function isDataFresh(bytes32 key) external view returns (bool);
}

/**
 * @title Fargard7PolicyAdapter
 * @dev Proposal-only coordinator for Fargard 7 economic signals.
 */
contract Fargard7PolicyAdapter is AccessControl, ReentrancyGuard {
    bytes32 public constant POLICY_ADMIN_ROLE = keccak256("POLICY_ADMIN_ROLE");
    bytes32 public constant RECOMMENDER_ROLE = keccak256("RECOMMENDER_ROLE");

    bytes32 public constant KEY_GLOBAL_CPI = keccak256("GLOBAL_CPI");
    bytes32 public constant KEY_USD_GOLD = keccak256("USD_GOLD");
    bytes32 public constant KEY_GAS_USD = keccak256("GAS_USD");

    enum StressLevel {
        Normal,
        Elevated,
        Severe
    }

    struct Thresholds {
        int256 elevatedCpi;
        int256 severeCpi;
        int256 elevatedGold;
        int256 severeGold;
        int256 elevatedGas;
        int256 severeGas;
    }

    struct SignalSnapshot {
        int256 globalCpi;
        int256 usdGold;
        int256 gasUsd;
        uint256 globalCpiTimestamp;
        uint256 usdGoldTimestamp;
        uint256 gasUsdTimestamp;
        bool globalCpiFresh;
        bool usdGoldFresh;
        bool gasUsdFresh;
        bool allSignalsFresh;
    }

    struct PolicyRecommendation {
        uint256 id;
        address requester;
        StressLevel stressLevel;
        bool executable;
        uint256 timestamp;
        SignalSnapshot snapshot;
        string rationale;
    }

    IFargard7PriceOracle public priceOracle;
    Thresholds public thresholds;
    uint256 public recommendationCount;

    mapping(uint256 => PolicyRecommendation) private _recommendations;

    event PriceOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event ThresholdsUpdated(
        int256 elevatedCpi,
        int256 severeCpi,
        int256 elevatedGold,
        int256 severeGold,
        int256 elevatedGas,
        int256 severeGas
    );
    event PolicyRecommendationCreated(
        uint256 indexed recommendationId,
        address indexed requester,
        StressLevel stressLevel,
        bool executable,
        int256 globalCpi,
        int256 usdGold,
        int256 gasUsd,
        string rationale
    );

    constructor(address _kernel, address _priceOracle) {
        require(_kernel != address(0), "Fargard7PolicyAdapter: invalid kernel");
        require(_priceOracle != address(0), "Fargard7PolicyAdapter: invalid oracle");

        _grantRole(DEFAULT_ADMIN_ROLE, _kernel);
        _grantRole(POLICY_ADMIN_ROLE, _kernel);
        _grantRole(RECOMMENDER_ROLE, _kernel);

        priceOracle = IFargard7PriceOracle(_priceOracle);
        thresholds = Thresholds({
            elevatedCpi: 120 * int256(1e18),
            severeCpi: 150 * int256(1e18),
            elevatedGold: 2_000 * int256(1e18),
            severeGold: 2_500 * int256(1e18),
            elevatedGas: 50 * int256(1e18),
            severeGas: 100 * int256(1e18)
        });
    }

    function setPriceOracle(address newPriceOracle) external onlyRole(POLICY_ADMIN_ROLE) {
        require(newPriceOracle != address(0), "Fargard7PolicyAdapter: invalid oracle");
        address oldOracle = address(priceOracle);
        priceOracle = IFargard7PriceOracle(newPriceOracle);
        emit PriceOracleUpdated(oldOracle, newPriceOracle);
    }

    function setThresholds(Thresholds calldata newThresholds) external onlyRole(POLICY_ADMIN_ROLE) {
        _validateThresholds(newThresholds);
        thresholds = newThresholds;
        emit ThresholdsUpdated(
            newThresholds.elevatedCpi,
            newThresholds.severeCpi,
            newThresholds.elevatedGold,
            newThresholds.severeGold,
            newThresholds.elevatedGas,
            newThresholds.severeGas
        );
    }

    function getSignalSnapshot() public view returns (SignalSnapshot memory snapshot) {
        (snapshot.globalCpi, snapshot.globalCpiTimestamp, ) = priceOracle.getPrice(KEY_GLOBAL_CPI);
        (snapshot.usdGold, snapshot.usdGoldTimestamp, ) = priceOracle.getPrice(KEY_USD_GOLD);
        (snapshot.gasUsd, snapshot.gasUsdTimestamp, ) = priceOracle.getPrice(KEY_GAS_USD);

        snapshot.globalCpiFresh = priceOracle.isDataFresh(KEY_GLOBAL_CPI);
        snapshot.usdGoldFresh = priceOracle.isDataFresh(KEY_USD_GOLD);
        snapshot.gasUsdFresh = priceOracle.isDataFresh(KEY_GAS_USD);
        snapshot.allSignalsFresh = snapshot.globalCpiFresh && snapshot.usdGoldFresh && snapshot.gasUsdFresh;
    }

    function previewStressLevel() external view returns (StressLevel stressLevel, bool validSnapshot) {
        SignalSnapshot memory snapshot = getSignalSnapshot();
        if (!snapshot.allSignalsFresh) return (StressLevel.Normal, false);
        return (_classify(snapshot), true);
    }

    function createRecommendation(string calldata rationale)
        external
        onlyRole(RECOMMENDER_ROLE)
        nonReentrant
        returns (uint256 recommendationId)
    {
        SignalSnapshot memory snapshot = getSignalSnapshot();
        require(snapshot.allSignalsFresh, "Fargard7PolicyAdapter: stale or invalid signal");

        recommendationCount++;
        recommendationId = recommendationCount;

        StressLevel stressLevel = _classify(snapshot);
        _recommendations[recommendationId] = PolicyRecommendation({
            id: recommendationId,
            requester: msg.sender,
            stressLevel: stressLevel,
            executable: false,
            timestamp: block.timestamp,
            snapshot: snapshot,
            rationale: rationale
        });

        emit PolicyRecommendationCreated(
            recommendationId,
            msg.sender,
            stressLevel,
            false,
            snapshot.globalCpi,
            snapshot.usdGold,
            snapshot.gasUsd,
            rationale
        );
    }

    function getRecommendation(uint256 recommendationId) external view returns (PolicyRecommendation memory) {
        require(recommendationId > 0 && recommendationId <= recommendationCount, "Fargard7PolicyAdapter: invalid recommendation");
        return _recommendations[recommendationId];
    }

    function _classify(SignalSnapshot memory snapshot) internal view returns (StressLevel) {
        Thresholds memory t = thresholds;
        if (snapshot.globalCpi >= t.severeCpi || snapshot.usdGold >= t.severeGold || snapshot.gasUsd >= t.severeGas) {
            return StressLevel.Severe;
        }
        if (
            snapshot.globalCpi >= t.elevatedCpi ||
            snapshot.usdGold >= t.elevatedGold ||
            snapshot.gasUsd >= t.elevatedGas
        ) {
            return StressLevel.Elevated;
        }
        return StressLevel.Normal;
    }

    function _validateThresholds(Thresholds calldata newThresholds) internal pure {
        require(newThresholds.elevatedCpi > 0, "Fargard7PolicyAdapter: invalid CPI threshold");
        require(newThresholds.elevatedGold > 0, "Fargard7PolicyAdapter: invalid gold threshold");
        require(newThresholds.elevatedGas > 0, "Fargard7PolicyAdapter: invalid gas threshold");
        require(newThresholds.severeCpi >= newThresholds.elevatedCpi, "Fargard7PolicyAdapter: invalid CPI order");
        require(newThresholds.severeGold >= newThresholds.elevatedGold, "Fargard7PolicyAdapter: invalid gold order");
        require(newThresholds.severeGas >= newThresholds.elevatedGas, "Fargard7PolicyAdapter: invalid gas order");
    }
}
