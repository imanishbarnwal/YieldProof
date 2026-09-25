// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AttestorRegistry.sol";
import "./interfaces/IENSResolver.sol";

/**
 * @title YieldProofENSManager
 * @notice ENSv2-compatible subname registrar and reputation resolver for YieldProof Attestors.
 * @dev Issues and manages portable subnames (e.g. 'attestor-001.yieldproof.eth') with dynamic reputation resolution.
 */
contract YieldProofENSManager is Ownable, IENSResolver {
    /// @notice Parent domain namespace (e.g. "yieldproof.eth")
    string public parentName;
    bytes32 public parentNode;

    /// @notice Reference to the AttestorRegistry contract
    AttestorRegistry public attestorRegistry;

    /// @notice Total subnames issued
    uint256 public totalSubnames;

    /// @notice Subname label => attestor address
    mapping(string => address) public labelToAttestor;

    /// @notice Node => attestor address
    mapping(bytes32 => address) public nodeToAttestor;

    /// @notice Attestor address => full ENS subname (e.g. "attestor-001.yieldproof.eth")
    mapping(address => string) public attestorToSubname;

    /// @notice Custom text records override (node => key => value)
    mapping(bytes32 => mapping(string => string)) private _textRecords;

    // Events
    event SubnameCreated(address indexed attestor, string label, string fullName, bytes32 indexed node);
    event ParentNameUpdated(string newParentName, bytes32 newParentNode);
    event AttestorRegistryUpdated(address newRegistry);

    constructor(
        address _attestorRegistry,
        string memory _parentName
    ) Ownable(msg.sender) {
        attestorRegistry = AttestorRegistry(_attestorRegistry);
        _setParentName(_parentName);
    }

    function _setParentName(string memory _parentName) internal {
        parentName = _parentName;
        parentNode = namehash(_parentName);
        emit ParentNameUpdated(_parentName, parentNode);
    }

    /**
     * @notice Updates the parent ENS domain.
     */
    function setParentName(string calldata _parentName) external onlyOwner {
        _setParentName(_parentName);
    }

    /**
     * @notice Updates the AttestorRegistry contract address.
     */
    function setAttestorRegistry(address _attestorRegistry) external onlyOwner {
        attestorRegistry = AttestorRegistry(_attestorRegistry);
        emit AttestorRegistryUpdated(_attestorRegistry);
    }

    /**
     * @notice Computes standard ENS namehash for a domain string (e.g. "yieldproof.eth").
     */
    function namehash(string memory name) public pure returns (bytes32) {
        bytes memory nameBytes = bytes(name);
        if (nameBytes.length == 0) {
            return bytes32(0);
        }

        // Split by dots and compute namehash from right to left
        bytes32 node = bytes32(0);
        int256 lastDot = int256(nameBytes.length);

        for (int256 i = int256(nameBytes.length) - 1; i >= 0; i--) {
            if (nameBytes[uint256(i)] == ".") {
                bytes memory labelBytes = new bytes(uint256(lastDot - i - 1));
                for (uint256 j = 0; j < labelBytes.length; j++) {
                    labelBytes[j] = nameBytes[uint256(i + 1 + int256(j))];
                }
                node = keccak256(abi.encodePacked(node, keccak256(labelBytes)));
                lastDot = i;
            }
        }

        bytes memory firstLabelBytes = new bytes(uint256(lastDot));
        for (uint256 j = 0; j < firstLabelBytes.length; j++) {
            firstLabelBytes[j] = nameBytes[j];
        }
        node = keccak256(abi.encodePacked(node, keccak256(firstLabelBytes)));

        return node;
    }

    /**
     * @notice Computes the subnode for a given label under the parent domain.
     */
    function subnode(string memory label) public view returns (bytes32) {
        return keccak256(abi.encodePacked(parentNode, keccak256(bytes(label))));
    }

    /**
     * @notice Registers a custom subname label for the caller (must be an active attestor).
     * @param label The label to register (e.g. "attestor-007")
     */
    function createAttestorSubname(string calldata label) external returns (string memory fullName) {
        require(bytes(label).length > 0, "ENSManager: label cannot be empty");
        (bool isRegistered, ) = attestorRegistry.attestors(msg.sender);
        require(isRegistered, "ENSManager: caller is not a registered attestor");
        require(bytes(attestorToSubname[msg.sender]).length == 0, "ENSManager: attestor already has an ENS subname");
        require(labelToAttestor[label] == address(0), "ENSManager: subname label already taken");

        bytes32 node = subnode(label);
        fullName = string(abi.encodePacked(label, ".", parentName));

        labelToAttestor[label] = msg.sender;
        nodeToAttestor[node] = msg.sender;
        attestorToSubname[msg.sender] = fullName;
        totalSubnames++;

        emit SubnameCreated(msg.sender, label, fullName, node);
        emit AddrChanged(node, msg.sender);
    }

    /**
     * @notice Automatically creates a deterministic subname e.g. "attestor-1.yieldproof.eth" for caller.
     */
    function autoCreateAttestorSubname() external returns (string memory fullName) {
        string memory label = string(abi.encodePacked("attestor-", _uintToString(totalSubnames + 1)));
        
        // If label already exists for any reason, find next available index
        uint256 index = totalSubnames + 1;
        while (labelToAttestor[label] != address(0)) {
            index++;
            label = string(abi.encodePacked("attestor-", _uintToString(index)));
        }

        (bool isRegistered, ) = attestorRegistry.attestors(msg.sender);
        require(isRegistered, "ENSManager: caller is not a registered attestor");
        require(bytes(attestorToSubname[msg.sender]).length == 0, "ENSManager: attestor already has an ENS subname");

        bytes32 node = subnode(label);
        fullName = string(abi.encodePacked(label, ".", parentName));

        labelToAttestor[label] = msg.sender;
        nodeToAttestor[node] = msg.sender;
        attestorToSubname[msg.sender] = fullName;
        totalSubnames++;

        emit SubnameCreated(msg.sender, label, fullName, node);
        emit AddrChanged(node, msg.sender);
    }

    /**
     * @notice Standard ENS resolver address lookup.
     */
    function addr(bytes32 node) external view override returns (address payable) {
        return payable(nodeToAttestor[node]);
    }

    /**
     * @notice Standard ENS resolver dynamic text record lookup.
     * @dev Resolves live protocol metrics directly from AttestorRegistry!
     */
    function text(bytes32 node, string calldata key) external view override returns (string memory) {
        // If an explicit override text record exists, return it
        if (bytes(_textRecords[node][key]).length > 0) {
            return _textRecords[node][key];
        }

        address attestor = nodeToAttestor[node];
        if (attestor == address(0)) {
            return "";
        }

        bytes32 keyHash = keccak256(bytes(key));

        if (keyHash == keccak256("app/yieldproof/status")) {
            (bool isRegistered, ) = attestorRegistry.attestors(attestor);
            return isRegistered ? "Active" : "Inactive";
        }

        if (keyHash == keccak256("app/yieldproof/trust-score")) {
            uint256 score = attestorRegistry.getTrustScore(attestor);
            return _uintToString(score);
        }

        if (keyHash == keccak256("app/yieldproof/claims-verified") || keyHash == keccak256("app/yieldproof/successful-attestations")) {
            uint256 successCount = attestorRegistry.successfulAttestations(attestor);
            return _uintToString(successCount);
        }

        if (keyHash == keccak256("app/yieldproof/total-attestations")) {
            uint256 total = attestorRegistry.totalAttestationsCount(attestor);
            return _uintToString(total);
        }

        if (keyHash == keccak256("app/yieldproof/world-verified")) {
            bool isWorldId = attestorRegistry.isWorldIdVerified(attestor);
            return isWorldId ? "true" : "false";
        }

        if (keyHash == keccak256("app/yieldproof/stake")) {
            (, uint256 stake) = attestorRegistry.attestors(attestor);
            return string(abi.encodePacked(_uintToString(stake / 1e18), " MNT"));
        }

        if (keyHash == keccak256("app/yieldproof/lifetime-rewards")) {
            uint256 claimed = attestorRegistry.totalRewardsClaimed(attestor);
            return _uintToString(claimed);
        }

        return "";
    }

    /**
     * @notice Allows an attestor to set custom text records for their subname.
     */
    function setText(bytes32 node, string calldata key, string calldata value) external {
        address attestor = nodeToAttestor[node];
        require(msg.sender == attestor || msg.sender == owner(), "ENSManager: unauthorized to set text record");

        _textRecords[node][key] = value;
        emit TextChanged(node, key, key, value);
    }

    /**
     * @notice Comprehensive reputation profile lookup for an ENS subname or label.
     */
    function getAttestorProfile(string calldata labelOrSubname) external view returns (
        address attestorAddress,
        string memory fullSubname,
        bool isRegistered,
        bool isWorldIdVerified,
        uint256 trustScore,
        uint256 successfulAttestations,
        uint256 totalAttestations,
        uint256 stakeAmount,
        uint256 totalRewardsClaimed
    ) {
        address resolved = labelToAttestor[labelOrSubname];
        if (resolved == address(0)) {
            bytes32 node = namehash(labelOrSubname);
            resolved = nodeToAttestor[node];
        }

        if (resolved == address(0)) {
            return (address(0), "", false, false, 0, 0, 0, 0, 0);
        }

        attestorAddress = resolved;
        fullSubname = attestorToSubname[resolved];
        
        (bool reg, uint256 stake) = attestorRegistry.attestors(resolved);
        isRegistered = reg;
        stakeAmount = stake;
        isWorldIdVerified = attestorRegistry.isWorldIdVerified(resolved);
        trustScore = attestorRegistry.getTrustScore(resolved);
        successfulAttestations = attestorRegistry.successfulAttestations(resolved);
        totalAttestations = attestorRegistry.totalAttestationsCount(resolved);
        totalRewardsClaimed = attestorRegistry.totalRewardsClaimed(resolved);
    }

    /**
     * @dev Converts uint256 to string
     */
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
