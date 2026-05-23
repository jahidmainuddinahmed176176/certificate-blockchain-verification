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

// Create leaf objects with original cert reference
const leafObjects = certificates.map(cert => ({
    cert: cert,
    leaf: hashCertificate(cert)
}));

// Sort leaves
leafObjects.sort((a, b) => a.leaf.localeCompare(b.leaf));

console.log("Sorted leaves with their certificates:");
leafObjects.forEach((obj, idx) => {
    console.log(`  ${idx}: ${obj.leaf} (${obj.cert.id})`);
});

function buildTreeAndProofs(sortedLeafObjects) {
    let leaves = sortedLeafObjects.map(obj => obj.leaf);
    let tree = [leaves];
    
    while (tree[tree.length - 1].length > 1) {
        const current = tree[tree.length - 1];
        const next = [];
        for (let i = 0; i < current.length; i += 2) {
            const left = current[i];
            const right = i + 1 < current.length ? current[i + 1] : left;
            next.push(ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32'], [left, right])));
        }
        tree.push(next);
    }
    
    const root = tree[tree.length - 1][0];
    
    const proofs = {};
    for (let idx = 0; idx < sortedLeafObjects.length; idx++) {
        const obj = sortedLeafObjects[idx];
        const leaf = obj.leaf;
        let proof = [];
        let currentIdx = idx;
        
        for (let level = 0; level < tree.length - 1; level++) {
            const layer = tree[level];
            const pairIdx = currentIdx % 2 === 0 ? currentIdx + 1 : currentIdx - 1;
            if (pairIdx < layer.length) {
                proof.push(layer[pairIdx]);
            }
            currentIdx = Math.floor(currentIdx / 2);
        }
        proofs[leaf] = proof;
    }
    
    return { root, proofs };
}

const { root, proofs } = buildTreeAndProofs(leafObjects);
console.log(`\nMerkle Root: ${root}`);

console.log("\n===== CERTIFICATES FOR FRONTEND =====");
for (const obj of leafObjects) {
    const cert = obj.cert;
    const leaf = obj.leaf;
    const proof = proofs[leaf];
    const qrData = `${cert.id}|${cert.name}|${cert.nonce}`;
    
    // Verify locally
    let computed = leaf;
    for (const p of proof) {
        computed = ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32'], [computed, p]));
    }
    const valid = computed === root;
    
    console.log(`\n"${qrData}": {`);
    console.log(`    leaf: "${leaf}",`);
    console.log(`    proof: [${proof.map(p => `"${p}"`).join(", ")}]`);
    console.log(`},  // ${valid ? "✅ VALID" : "❌ INVALID"}`);
}

console.log("\n===== UPDATE verification-fixed.html WITH THESE VALUES =====");