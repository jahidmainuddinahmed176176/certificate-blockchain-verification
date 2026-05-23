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

// Generate leaves and sort
let leaves = certificates.map(c => hashCertificate(c));
leaves.sort((a, b) => a.localeCompare(b));

console.log("Sorted Leaves:");
leaves.forEach((l, i) => console.log(`  ${i}: ${l}`));

// Build the exact tree the contract uses
function buildTree(leaves) {
    let layer = [...leaves];
    const tree = [layer];
    
    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            const hash = ethers.keccak256(
                ethers.solidityPacked(['bytes32', 'bytes32'], [left, right])
            );
            nextLayer.push(hash);
        }
        tree.push(nextLayer);
        layer = nextLayer;
    }
    
    return tree;
}

function getProof(tree, leafValue) {
    // Find the leaf index in the original leaves layer
    const leafIndex = tree[0].findIndex(l => l === leafValue);
    if (leafIndex === -1) return [];
    
    const proof = [];
    let currentIdx = leafIndex;
    
    for (let level = 0; level < tree.length - 1; level++) {
        const layer = tree[level];
        let pairIdx;
        
        if (currentIdx % 2 === 0) {
            pairIdx = currentIdx + 1;
        } else {
            pairIdx = currentIdx - 1;
        }
        
        if (pairIdx < layer.length) {
            proof.push(layer[pairIdx]);
        }
        
        currentIdx = Math.floor(currentIdx / 2);
    }
    
    return proof;
}

const tree = buildTree(leaves);
const root = tree[tree.length - 1][0];
console.log(`\nMerkle Root: ${root}`);

console.log("\n===== CERTIFICATES WITH PROOFS =====");
for (const cert of certificates) {
    const leaf = hashCertificate(cert);
    const proof = getProof(tree, leaf);
    
    // Verify locally
    let computed = leaf;
    for (const p of proof) {
        computed = ethers.keccak256(
            ethers.solidityPacked(['bytes32', 'bytes32'], [p, computed])
        );
    }
    const isValid = computed === root;
    
    console.log(`\n${cert.id}:`);
    console.log(`  QR: ${cert.id}|${cert.name}|${cert.nonce}`);
    console.log(`  Leaf: ${leaf}`);
    console.log(`  Proof: [${proof.join(", ")}]`);
    console.log(`  Local Verify: ${isValid ? "✅" : "❌"}`);
}

// Now test with the actual contract
console.log("\n===== TESTING WITH ACTUAL CONTRACT =====");
import { ethers as ethersLib } from "ethers";
const provider = new ethersLib.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const contractAddress = "0x44e415bc9C4bA95C8eD42Be5D1641E19F1E8Bf50";
const abi = ["function isValidCertificate(bytes32[] memory proof, bytes32 leaf) view returns (bool)"];
const contract = new ethersLib.Contract(contractAddress, abi, provider);

for (const cert of certificates) {
    const leaf = hashCertificate(cert);
    const proof = getProof(tree, leaf);
    const result = await contract.isValidCertificate(proof, leaf);
    console.log(`${cert.id}: Contract says ${result ? "VALID ✅" : "INVALID ❌"}`);
}