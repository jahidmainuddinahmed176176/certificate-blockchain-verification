import { ethers } from "ethers";

// Helper function to hash certificate data
function hashCertificate(certificateId, recipientName, issueDate, metadataHash, nonce) {
  const message = certificateId + recipientName + issueDate + metadataHash + nonce;
  return ethers.keccak256(ethers.toUtf8Bytes(message));
}

// Certificate data structure
const certificates = [
  {
    id: "CERT-001",
    name: "Alice Chen",
    date: "2026-05-22",
    metadata: "QmHash123",
    nonce: "secret789"
  },
  {
    id: "CERT-002", 
    name: "Bob Wilson",
    date: "2026-05-22",
    metadata: "QmHash456",
    nonce: "secret456"
  },
  {
    id: "CERT-003",
    name: "Charlie Davis",
    date: "2026-05-22", 
    metadata: "QmHash789",
    nonce: "secret123"
  }
];

// Generate leaf hashes
const leaves = certificates.map(cert => 
  hashCertificate(cert.id, cert.name, cert.date, cert.metadata, cert.nonce)
);

// Sort leaves (required for Merkle tree)
leaves.sort();

// Build Merkle tree
function buildMerkleTree(leaves) {
  let layer = leaves;
  const tree = [layer];
  
  while (layer.length > 1) {
    const nextLayer = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : left;
      const parent = ethers.keccak256(
        Buffer.concat([left.slice(2), right.slice(2)].map(x => Buffer.from(x.slice(2), "hex")))
      );
      nextLayer.push(parent);
    }
    tree.push(nextLayer);
    layer = nextLayer;
  }
  
  return tree;
}

const tree = buildMerkleTree(leaves);
const root = tree[tree.length - 1][0];

console.log("Merkle Root:", root);
console.log("\nCertificate Leaves and Proofs:");
console.log("==============================");

// Generate proofs for each certificate
for (let i = 0; i < certificates.length; i++) {
  const leaf = leaves[i];
  let index = leaves.findIndex(l => l === leaf);
  let proof = [];
  let layer = leaves;
  let position = index;
  
  for (let level = 0; level < tree.length - 1; level++) {
    const pairIndex = position % 2 === 0 ? position + 1 : position - 1;
    if (pairIndex < layer.length) {
      proof.push(layer[pairIndex]);
    } else {
      proof.push(layer[position]);
    }
    position = Math.floor(position / 2);
    layer = tree[level + 1];
  }
  
  console.log(`\nCertificate ${certificates[i].id}:`);
  console.log(`  Recipient: ${certificates[i].name}`);
  console.log(`  Leaf Hash: ${leaf}`);
  console.log(`  Proof: [${proof.join(", ")}]`);
  console.log(`  QR Data: ${certificates[i].id}|${certificates[i].name}|${certificates[i].nonce}`);
}

console.log("\n===== SETUP INSTRUCTIONS =====");
console.log("1. Deploy contract using: npx hardhat run scripts/deploy.js --network sepolia");
console.log("2. Set Merkle root using: npx hardhat run scripts/set-root.js --network sepolia");