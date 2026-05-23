import { ethers } from "ethers";

const certificates = [
    { id: "CERT-001", name: "Alice Chen", nonce: "secret789" },
    { id: "CERT-002", name: "Bob Wilson", nonce: "secret456" },
    { id: "CERT-003", name: "Charlie Davis", nonce: "secret123" }
];

function hashCertificate(certificateId, recipientName, nonce) {
    const encoded = ethers.solidityPacked(
        ['string', 'string', 'string'],
        [certificateId, recipientName, nonce]
    );
    return ethers.keccak256(encoded);
}

const leaves = certificates.map(cert => hashCertificate(cert.id, cert.name, cert.nonce));
const sortedLeaves = [...leaves].sort((a, b) => a.localeCompare(b));

console.log("Sorted Leaves:");
sortedLeaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

function buildTreeAndGetProofs(leaves) {
    let tree = [leaves];
    while (tree[tree.length - 1].length > 1) {
        const currentLayer = tree[tree.length - 1];
        const nextLayer = [];
        for (let i = 0; i < currentLayer.length; i += 2) {
            const left = currentLayer[i];
            const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
            const combined = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [left, right]
            );
            nextLayer.push(combined);
        }
        tree.push(nextLayer);
    }
    
    const root = tree[tree.length - 1][0];
    
    const proofs = {};
    for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let proof = [];
        let currentIdx = idx;
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
        proofs[leaf] = proof;
    }
    
    return { root, proofs };
}

const { root, proofs } = buildTreeAndGetProofs(sortedLeaves);
console.log("\nMerkle Root:", root);

console.log("\n===== CERTIFICATES WITH PROOFS =====");
for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const leaf = leaves[i];
    const proof = proofs[leaf];
    console.log(`\n${cert.id}:`);
    console.log(`  QR Data: ${cert.id}|${cert.name}|${cert.nonce}`);
    console.log(`  Leaf: ${leaf}`);
    console.log(`  Proof: [${proof.join(", ")}]`);
}