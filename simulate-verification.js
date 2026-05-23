import { ethers } from "ethers";

const CONTRACT = "0x44e415bc9C4bA95C8eD42Be5D1641E19F1E8Bf50";
const ABI = ["function isValidCertificate(bytes32[] memory proof, bytes32 leaf) view returns (bool)", "function currentMerkleRoot() view returns (bytes32)"];

const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const contract = new ethers.Contract(CONTRACT, ABI, provider);

// Get the root from contract
const root = await contract.currentMerkleRoot();
console.log("Root from contract:", root);

// CERT-001 data from generate-proofs-fixed.js
const leaf = "0x139ca341b4aa03adb7af37c69a9c4ce59c2291bbf71dc80ef8c74cf3e5a00439";
const proof = [
    "0x102d59447bad54a0c03bed9d93d11f13aefe6440c3857634611e265b4b7a5e0c",
    "0xcab0b48b002f035fe070ca62d72f36f0e193500bbe0565d49f195a46d5548003"
];

// Simulate contract's verification
let computedHash = leaf;
for (let i = 0; i < proof.length; i++) {
    const proofElement = proof[i];
    // Contract uses: keccak256(abi.encodePacked(proofElement, computedHash))
    computedHash = ethers.solidityPackedKeccak256(
        ['bytes32', 'bytes32'],
        [proofElement, computedHash]
    );
    console.log(`After proof ${i}: ${computedHash}`);
}

console.log("\nFinal computed hash:", computedHash);
console.log("Root from contract:", root);
console.log("Match:", computedHash === root ? "YES ✅" : "NO ❌");

// Now try the reverse order
let computedHashReverse = leaf;
for (let i = 0; i < proof.length; i++) {
    const proofElement = proof[i];
    computedHashReverse = ethers.solidityPackedKeccak256(
        ['bytes32', 'bytes32'],
        [computedHashReverse, proofElement]
    );
    console.log(`Reverse after proof ${i}: ${computedHashReverse}`);
}

console.log("\nReverse final computed hash:", computedHashReverse);
console.log("Match with reverse order:", computedHashReverse === root ? "YES ✅" : "NO ❌");

// Call the actual contract
const contractResult = await contract.isValidCertificate(proof, leaf);
console.log("\nContract says:", contractResult);