// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title CertificateVerification
 * @dev Gas-optimized certificate verification using Merkle trees
 * Anyone can verify a certificate by providing the Merkle proof
 * No personal data stored on-chain - only cryptographic hashes
 */
contract CertificateVerification {
    // Current Merkle root for active certificates
    bytes32 public currentMerkleRoot;
    
    // Owner of the contract (issuer authority)
    address public owner;
    
    // Track used certificates to prevent double-spending/claiming
    mapping(bytes32 => bool) public usedCertificates;
    
    // Events
    event MerkleRootUpdated(bytes32 newRoot, uint256 timestamp);
    event CertificateVerified(bytes32 indexed leafHash, bool isValid);
    event CertificateClaimed(bytes32 indexed leafHash, address claimer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        currentMerkleRoot = bytes32(0);
    }
    
    /**
     * @dev Update the Merkle root (issuer updates the certificate list)
     * @param _newRoot The new Merkle root
     */
    function setMerkleRoot(bytes32 _newRoot) external onlyOwner {
        require(_newRoot != bytes32(0), "Root cannot be zero");
        currentMerkleRoot = _newRoot;
        emit MerkleRootUpdated(_newRoot, block.timestamp);
    }
    
    /**
     * @dev Verify if a certificate exists - FREE (no gas cost)
     * @param proof Merkle proof array
     * @param leaf Hash of the certificate data
     * @return bool True if certificate is valid
     */
    function isValidCertificate(bytes32[] calldata proof, bytes32 leaf) 
        public 
        view 
        returns (bool) 
    {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        bool isValid = (computedHash == currentMerkleRoot);
        return isValid;
    }
    
    /**
     * @dev Claim an offer using a certificate (small gas cost)
     * @param proof Merkle proof array
     * @param leaf Hash of the certificate data
     */
    function claimCertificate(bytes32[] calldata proof, bytes32 leaf) external {
        require(isValidCertificate(proof, leaf), "Invalid certificate");
        require(!usedCertificates[leaf], "Certificate already claimed");
        
        usedCertificates[leaf] = true;
        emit CertificateClaimed(leaf, msg.sender);
    }
    
    /**
     * @dev Check if a certificate has been claimed
     * @param leaf Hash of the certificate data
     * @return bool True if claimed
     */
    function isCertificateClaimed(bytes32 leaf) external view returns (bool) {
        return usedCertificates[leaf];
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}

// Helper library for generating hashes from certificate data
library CertificateHelper {
    /**
     * @dev Generate leaf hash from certificate fields
     * @param certificateId Unique certificate ID
     * @param recipientName Name of the certificate holder
     * @param issueDate Date issued (YYYY-MM-DD or timestamp)
     * @param metadataHash Hash of additional certificate data (IPFS, etc.)
     * @param nonce Secret nonce for privacy
     */
    function hashCertificate(
        string memory certificateId,
        string memory recipientName,
        string memory issueDate,
        string memory metadataHash,
        string memory nonce
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                certificateId,
                recipientName,
                issueDate,
                metadataHash,
                nonce
            )
        );
    }
    
    /**
     * @dev Alternative: hash from bytes32 metadata (more gas efficient)
     * @param certificateId Certificate ID
     * @param recipientAddress Recipient's Ethereum address
     * @param metadataHash Hash of certificate metadata
     */
    function hashCertificateSimple(
        string memory certificateId,
        address recipientAddress,
        bytes32 metadataHash
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                certificateId,
                recipientAddress,
                metadataHash
            )
        );
    }
}