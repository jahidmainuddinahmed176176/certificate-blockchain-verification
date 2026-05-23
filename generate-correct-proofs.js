import { ethers } from "ethers";
import { keccak256, toUtf8Bytes, solidityPackedKeccak256 } from "ethers";

// Certificate data
const certificates = [
    { id: "CERT-001", name: "Alice Chen", nonce: "secret789" },
    { id: "CERT-002", name: "Bob Wilson", nonce: "secret456" },
    { id: "CERT-003", name: "Charlie Davis", nonce: "secret123" }
];

// Hash function matching the contract's CertificateHelper
function hashCertificate(certificateId, recipientName, nonce) {
    // Match the contract's abi.encodePacked ordering
    const encoded = ethers.solidityPacked(
        ['string', 'string', 'string'],
        [certificateId, recipientName, nonce]
    );
    return ethers.keccak256(encoded);
}

// Generate leaves
const leaves = certificates.map(cert => 
    hashCertificate(cert.id, cert.name, cert.nonce)
);

console.log("Leaves:");
leaves.forEach((leaf, i) => {
    console.log(`  ${certificates[i].id}: ${leaf}`);
});

// Sort leaves (required for Merkle tree)
const sortedLeaves = [...leaves].sort((a, b) => {
    return a.localeCompare(b);
});

console.log("\nSorted Leaves:");
sortedLeaves.forEach((leaf, i) => {
    console.log(`  ${i}: ${leaf}`);
});

// Build Merkle tree and generate proofs
function getProof(leaves, targetLeaf) {
    let layer = leaves;
    let proof = [];
    let index = leaves.findIndex(leaf => leaf === targetLeaf);
    
    while (layer.length > 1) {
        const pairIndex = index % 2 === 0 ? index + 1 : index - 1;
        
        if (pairIndex < layer.length) {
            proof.push(layer[pairIndex]);
        } else {
            proof.push(layer[index]);
        }
        
        // Build next layer
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            
            // Order matters: if left <= right, hash(left, right), else hash(right, left)
            let combined;
            if (left <= right) {
                combined = ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [left, right]);
            } else {
                combined = ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [right, left]);
            }
            nextLayer.push(combined);
        }
        
        layer = nextLayer;
        index = Math.floor(index / 2);
    }
    
    return proof;
}

// Calculate root
function getRoot(leaves) {
    let layer = leaves;
    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            
            let combined;
            if (left <= right) {
                combined = ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [left, right]);
            } else {
                combined = ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [right, left]);
            }
            nextLayer.push(combined);
        }
        layer = nextLayer;
    }
    return layer[0];
}

const root = getRoot(sortedLeaves);
console.log("\nMerkle Root:", root);
console.log("Expected root: 0x528ef768da53a073e7452f3bec232f0c00afa1d66b65efe73f0f36c033fa23dc");
console.log("Match:", root === "0x528ef768da53a073e7452f3bec232f0c00afa1d66b65efe73f0f36c033fa23dc" ? "YES ✅" : "NO ❌");

console.log("\n===== CORRECT PROOFS =====");
for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const leaf = leaves[i];
    const proof = getProof(sortedLeaves, leaf);
    
    console.log(`\n${cert.id}:`);
    console.log(`  QR Data: ${cert.id}|${cert.name}|${cert.nonce}`);
    console.log(`  Leaf: ${leaf}`);
    console.log(`  Proof: [${proof.join(", ")}]`);
}