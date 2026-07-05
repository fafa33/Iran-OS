// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal interface used by IranOS_Kernel for token reserve integration.
/// @dev Single-function interface. Do not expand without a separate architecture review.
///      GAP-MEX-05 closure artifact.
interface IPahlaviToken {
    /// @notice Compatibility surface for legacy oracle reserve reports; does not mutate monetary backing.
    /// @param newReserves The reported reserve value.
    function updateReserves(uint256 newReserves) external;

    /// @notice Links the token to the explicit recognized reserve backing registry.
    /// @param recognizedReserveBacking The RecognizedReserveBacking contract address.
    function setRecognizedReserveBacking(address recognizedReserveBacking) external;

    /// @notice Replaces token reserve accounting with recognizedBackingTotal from the linked registry.
    function syncRecognizedBackingTotal() external;
}
