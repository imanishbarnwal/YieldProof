// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWorldID
 * @notice The interface to the WorldID Router contract that verifies proofs.
 */
interface IWorldID {
    /**
     * @notice Verifies a WorldID zero knowledge proof.
     * @param root The of the Merkle tree that contains the user's identity.
     * @param groupId The id of the group to check membership against (1 for Orb, 0 for Phone).
     * @param signalHash A keccak256 hash of the user's signal passed to hashToField.
     * @param nullifierHash The unique nullifier for the user and external nullifier.
     * @param externalNullifierHash A keccak256 hash of the external nullifier passed to hashToField.
     * @param proof The zero-knowledge proof.
     */
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}
