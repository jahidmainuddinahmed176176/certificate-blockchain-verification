// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateVerificationFixed {
    bytes32 public currentMerkleRoot;
    address public owner;
    mapping(bytes32 => bool) public usedCertificates;

    event MerkleRootUpdated(bytes32 newRoot, uint256 timestamp);
    event CertificateClaimed(bytes32 indexed leafHash, address claimer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentMerkleRoot = bytes32(0);
    }

    function setMerkleRoot(bytes32 _newRoot) external onlyOwner {
        require(_newRoot != bytes32(0), "Root cannot be zero");
        currentMerkleRoot = _newRoot;
        emit MerkleRootUpdated(_newRoot, block.timestamp);
    }

    function isValidCertificate(bytes32[] calldata proof, bytes32 leaf) 
        public 
        view 
        returns (bool) 
    {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            // Standard Merkle tree ordering
            computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
        }
        
        return (computedHash == currentMerkleRoot);
    }

    function claimCertificate(bytes32[] calldata proof, bytes32 leaf) external {
        require(isValidCertificate(proof, leaf), "Invalid certificate");
        require(!usedCertificates[leaf], "Already claimed");
        usedCertificates[leaf] = true;
        emit CertificateClaimed(leaf, msg.sender);
    }

    function isCertificateClaimed(bytes32 leaf) external view returns (bool) {
        return usedCertificates[leaf];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}