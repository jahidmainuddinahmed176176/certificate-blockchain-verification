import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { bytesToHex, hexToBytes } from "ethereum-cryptography/utils.js";
import { ethers } from "ethers";

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
console.log("Leaves:");
leaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

// Sort leaves as required by the contract
const sortedLeaves = [...leaves].sort((a, b) => a.localeCompare(b));
console.log("\nSorted leaves:");
sortedLeaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

// Convert hex to bytes for merkletreejs
const leafBytes = sortedLeaves.map(l => hexToBytes(l.slice(2)));
const tree = new MerkleTree(leafBytes, keccak256, { sortPairs: true });
const root = bytesToHex(tree.getRoot());
console.log(`\nMerkle Root: 0x${root}`);

console.log("\n===== CERTIFICATES WITH PROOFS =====");
for (const cert of certificates) {
    const leaf = hashCertificate(cert);
    const leafIndex = sortedLeaves.findIndex(l => l === leaf);
    if (leafIndex === -1) continue;
    
    const proof = tree.getProof(leafBytes[leafIndex]);
    const proofHex = proof.map(p => `0x${bytesToHex(p.data)}`);
    
    // Verify locally
    const isValid = tree.verify(proof, leafBytes[leafIndex], tree.getRoot());
    
    console.log(`\n"${cert.id}|${cert.name}|${cert.nonce}": {`);
    console.log(`    leaf: "${leaf}",`);
    console.log(`    proof: [${proofHex.map(p => `"${p}"`).join(", ")}]`);
    console.log(`},  // ${isValid ? "✅ VALID" : "❌ INVALID"}`);
}