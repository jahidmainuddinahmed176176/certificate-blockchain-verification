// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StandardMerkleVerification {
    bytes32 public merkleRoot;
    address public owner;
    mapping(bytes32 => bool) public usedCertificates;

    event RootUpdated(bytes32 newRoot);
    event CertificateClaimed(bytes32 indexed leaf, address claimer);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit RootUpdated(_root);
    }

    function isValid(bytes32[] calldata proof, bytes32 leaf) public view returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
        }
        return computedHash == merkleRoot;
    }

    function claim(bytes32[] calldata proof, bytes32 leaf) external {
        require(isValid(proof, leaf), "Invalid proof");
        require(!usedCertificates[leaf], "Already claimed");
        usedCertificates[leaf] = true;
        emit CertificateClaimed(leaf, msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}