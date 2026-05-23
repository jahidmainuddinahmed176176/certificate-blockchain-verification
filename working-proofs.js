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

// Generate leaves
let leaves = certificates.map(c => hashCertificate(c));
leaves.sort((a, b) => a.localeCompare(b));

console.log("Leaves:");
leaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

// Build tree and generate proofs
function buildMerkleTree(leaves) {
    let tree = [leaves];
    let currentLayer = leaves;
    
    while (currentLayer.length > 1) {
        let nextLayer = [];
        for (let i = 0; i < currentLayer.length; i += 2) {
            const left = currentLayer[i];
            const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
            const hash = ethers.keccak256(
                ethers.solidityPacked(['bytes32', 'bytes32'], [left, right])
            );
            nextLayer.push(hash);
        }
        tree.push(nextLayer);
        currentLayer = nextLayer;
    }
    
    const root = tree[tree.length - 1][0];
    return { tree, root };
}

function getProof(tree, leafIndex) {
    let proof = [];
    let currentIdx = leafIndex;
    
    for (let level = 0; level < tree.length - 1; level++) {
        const layer = tree[level];
        const pairIdx = currentIdx % 2 === 0 ? currentIdx + 1 : currentIdx - 1;
        
        if (pairIdx < layer.length) {
            proof.push(layer[pairIdx]);
        } else {
            proof.push(layer[currentIdx]);
        }
        
        currentIdx = Math.floor(currentIdx / 2);
    }
    
    return proof;
}

const { tree, root } = buildMerkleTree(leaves);
console.log(`\nMerkle Root: ${root}`);

console.log("\n===== VERIFICATION DATA =====");
for (let i = 0; i < certificates.length; i++) {
    const leaf = leaves[i];
    const proof = getProof(tree, i);
    const leafIndex = leaves.findIndex(l => l === leaf);
    const originalCert = certificates.find(c => hashCertificate(c) === leaf);
    
    console.log(`\n${originalCert.id}:`);
    console.log(`  QR: ${originalCert.id}|${originalCert.name}|${originalCert.nonce}`);
    console.log(`  Leaf: ${leaf}`);
    console.log(`  Proof: [${proof.join(", ")}]`);
}

// Verify all proofs
console.log("\n===== VERIFYING ALL PROOFS =====");
for (let i = 0; i < certificates.length; i++) {
    const leaf = leaves[i];
    const proof = getProof(tree, i);
    
    let computed = leaf;
    for (const p of proof) {
        computed = ethers.keccak256(
            ethers.solidityPacked(['bytes32', 'bytes32'], [p, computed])
        );
    }
    const isValid = computed === root;
    console.log(`${certificates[i].id}: ${isValid ? "VALID ✅" : "INVALID ❌"}`);
}