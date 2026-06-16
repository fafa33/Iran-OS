// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal interface used by IranOS_Kernel to forward oracle reserve data.
/// @dev Single-function interface. Do not expand without a separate architecture review.
///      GAP-MEX-05 closure artifact.
interface IPahlaviToken {
    function updateReserves(uint256 newReserves) external;
}
