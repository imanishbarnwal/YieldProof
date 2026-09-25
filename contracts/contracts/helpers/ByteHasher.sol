// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ByteHasher {
    /// @dev The Snark scalar field order.
    uint256 internal constant SNARK_SCALAR_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    /// @notice Creates a keccak256 hash of a byte string and reduces it to a Snark scalar field.
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(value)) % SNARK_SCALAR_FIELD;
    }
}
