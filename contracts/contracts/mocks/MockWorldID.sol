// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IWorldID.sol";

/**
 * @title MockWorldID
 * @dev Mock contract for testing World ID proof verification.
 */
contract MockWorldID is IWorldID {
    bool public shouldPass = true;

    function setShouldPass(bool _shouldPass) external {
        shouldPass = _shouldPass;
    }

    function verifyProof(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256[8] calldata
    ) external view override {
        require(shouldPass, "MockWorldID: invalid proof");
    }
}
