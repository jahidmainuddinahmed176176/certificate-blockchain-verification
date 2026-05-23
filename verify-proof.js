import { ethers } from "ethers";

async function main() {
    const CONTRACT_ADDRESS = "0x680c2450F26659c3df672Eb1f90255F216e5175D";
    
    const ABI = [
        "function currentMerkleRoot() view returns (bytes32)",
        "function isValidCertificate(bytes32[] memory proof, bytes32 leaf) view returns (bool)"
    ];
    
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const root = await contract.currentMerkleRoot();
    console.log("Root from contract:", root);
    console.log("Expected root:      0x528ef768da53a073e7452f3bec232f0c00afa1d66b65efe73f0f36c033fa23dc");
    console.log("");
    
    // Test each certificate
    const certificates = [
        { name: "CERT-001", leaf: "0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af", proof: ["0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4", "0x4cf6e0dda32ea38319f599566d58eac76394ea6210b13c6f89e22444d6cc2731"] },
        { name: "CERT-002", leaf: "0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4", proof: ["0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af", "0x4cf6e0dda32ea38319f599566d58eac76394ea6210b13c6f89e22444d6cc2731"] },
        { name: "CERT-003", leaf: "0xf48021de0d0821d236d81b27d41a914a0e292eea4afd724e48f038e66a1b01f3", proof: ["0xf48021de0d0821d236d81b27d41a914a0e292eea4afd724e48f038e66a1b01f3", "0x7d596cdbc008f24d961577c926b1b317287f2ad1607935aaf466a417a1a8db4f"] }
    ];
    
    for (const cert of certificates) {
        const isValid = await contract.isValidCertificate(cert.proof, cert.leaf);
        console.log(`${cert.name}: ${isValid ? "VALID ✅" : "INVALID ❌"}`);
    }
}

main();