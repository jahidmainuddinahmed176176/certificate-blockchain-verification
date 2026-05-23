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

const leaves = certificates.map(cert => 
    hashCertificate(cert.id, cert.name, cert.nonce)
);

console.log("Leaves:");
leaves.forEach((leaf, i) => {
    console.log(`  ${certificates[i].id}: ${leaf}`);
});

const sortedLeaves = [...leaves].sort((a, b) => {
    return a.localeCompare(b);
});

console.log("\nSorted Leaves:");
sortedLeaves.forEach((leaf, i) => {
    console.log(`  ${i}: ${leaf}`);
});

function getRoot(leaves) {
    let layer = leaves;
    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            const combined = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [left, right]
            );
            nextLayer.push(combined);
        }
        layer = nextLayer;
    }
    return layer[0];
}

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
        
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            const combined = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [left, right]
            );
            nextLayer.push(combined);
        }
        
        layer = nextLayer;
        index = Math.floor(index / 2);
    }
    
    return proof;
}

const root = getRoot(sortedLeaves);
console.log("\nMerkle Root:", root);

console.log("\n===== PROOFS FOR FIXED CONTRACT =====");
console.log("(Use proof[0] + proof[1] in this exact order)\n");

for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const leaf = leaves[i];
    const proof = getProof(sortedLeaves, leaf);
    
    console.log(`${cert.id}:`);
    console.log(`  QR Data: ${cert.id}|${cert.name}|${cert.nonce}`);
    console.log(`  Leaf: ${leaf}`);
    console.log(`  Proof: [${proof.join(", ")}]`);
    console.log("");
}