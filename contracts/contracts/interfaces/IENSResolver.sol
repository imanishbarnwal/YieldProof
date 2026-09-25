// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IENSResolver
 * @notice Standard ENS Resolver interface for address and text record resolution.
 */
interface IENSResolver {
    event AddrChanged(bytes32 indexed node, address a);
    event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value);

    function addr(bytes32 node) external view returns (address payable);
    function text(bytes32 node, string calldata key) external view returns (string memory);
}
