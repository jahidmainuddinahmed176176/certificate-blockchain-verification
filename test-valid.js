import { ethers } from "ethers";

const CONTRACT = "0x680c2450F26659c3df672Eb1f90255F216e5175D";
const ABI = ["function isValidCertificate(bytes32[] memory proof, bytes32 leaf) view returns (bool)"];

const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const contract = new ethers.Contract(CONTRACT, ABI, provider);

const leaf = "0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af";
const proof = [
    "0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4",
    "0x4cf6e0dda32ea38319f599566d58eac76394ea6210b13c6f89e22444d6cc2731"
];

const result = await contract.isValidCertificate(proof, leaf);
console.log("Contract says valid:", result);