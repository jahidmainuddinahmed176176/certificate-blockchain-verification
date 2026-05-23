import { ethers } from "ethers";

const leaf = "0x139ca341b4aa03adb7af37c69a9c4ce59c2291bbf71dc80ef8c74cf3e5a00439";
const proof = [
    "0x102d59447bad54a0c03bed9d93d11f13aefe6440c3857634611e265b4b7a5e0c",
    "0xcab0b48b002f035fe070ca62d72f36f0e193500bbe0565d49f195a46d5548003"
];
const expectedRoot = "0xe390c7ce3538b80da56b9259857295fbad23f3c6c01f8da276a39d4ff0eeb9b2";

let computedHash = leaf;
for (let i = 0; i < proof.length; i++) {
    computedHash = ethers.solidityPackedKeccak256(
        ['bytes32', 'bytes32'],
        [proof[i], computedHash]
    );
    console.log(`Step ${i}: ${computedHash}`);
}

console.log(`\nFinal computed hash: ${computedHash}`);
console.log(`Expected root: ${expectedRoot}`);
console.log(`Match: ${computedHash === expectedRoot ? "YES" : "NO"}`);