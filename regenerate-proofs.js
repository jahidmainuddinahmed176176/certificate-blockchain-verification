import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { bytesToHex, hexToBytes } from "ethereum-cryptography/utils.js";

const certificates = [
    { id: "CERT-001", name: "Alice Chen", nonce: "secret789" },
    { id: "CERT-002", name: "Bob Wilson", nonce: "secret456" },
    { id: "CERT-003", name: "Charlie Davis", nonce: "secret123" }
];

function hashCertificate(cert) {
    return ethers.keccak256(
        ethers.solidityPacked(
            ['string', 'string', 'string'],
            [cert.id, cert.name, cert.nonce]
        )
    );
}

const leaves = certificates.map(c => hashCertificate(c));
const sortedLeaves = [...leaves].sort((a, b) => a.localeCompare(b));

console.log("Sorted leaves:");
sortedLeaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

// Convert hex to bytes
const leafBytes = sortedLeaves.map(l => hexToBytes(l.slice(2)));

// Build tree with keccak256 and sort pairs
const tree = new MerkleTree(leafBytes, keccak256, { sortPairs: true });
const root = bytesToHex(tree.getRoot());
console.log("\nMerkle Root:", `0x${root}`);

console.log("\n===== CORRECT PROOFS =====");
for (const cert of certificates) {
    const leaf = hashCertificate(cert);
    const leafIndex = sortedLeaves.findIndex(l => l === leaf);
    const leafBytesItem = leafBytes[leafIndex];
    const proof = tree.getProof(leafBytesItem);
    const proofHex = proof.map(p => `0x${bytesToHex(p.data)}`);
    
    // Verify
    const isValid = tree.verify(proof, leafBytesItem, tree.getRoot());
    
    console.log(`\n"${cert.id}|${cert.name}|${cert.nonce}": {`);
    console.log(`    leaf: "${leaf}",`);
    console.log(`    proof: [${proofHex.join(", ")}]`);
    console.log(`},  // ${isValid ? "VALID" : "INVALID"}`);
}