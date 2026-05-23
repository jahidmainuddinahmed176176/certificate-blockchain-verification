import { ethers } from "ethers";

const CONTRACT = "0x8795f60e40020edeC438f0b72108bF5Fb12805A8";
const ABI = ["function isValid(bytes32[] memory proof, bytes32 leaf) view returns (bool)"];

const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const contract = new ethers.Contract(CONTRACT, ABI, provider);

const leaf = "0x139ca341b4aa03adb7af37c69a9c4ce59c2291bbf71dc80ef8c74cf3e5a00439";
const proof = [
    "0x102d59447bad54a0c03bed9d93d11f13aefe6440c3857634611e265b4b7a5e0c",
    "0xcab0b48b002f035fe070ca62d72f36f0e193500bbe0565d49f195a46d5548003"
];

const result = await contract.isValid(proof, leaf);
console.log("CERT-001 valid:", result);