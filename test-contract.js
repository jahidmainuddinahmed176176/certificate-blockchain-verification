import { ethers } from "ethers";

async function main() {
    const CONTRACT_ADDRESS = "0x680c2450F26659c3df672Eb1f90255F216e5175D";
    
    const ABI = [
        "function currentMerkleRoot() view returns (bytes32)",
        "function owner() view returns (address)",
        "function isValidCertificate(bytes32[] memory proof, bytes32 leaf) view returns (bool)"
    ];
    
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    console.log("Checking contract...");
    
    try {
        const owner = await contract.owner();
        console.log("Owner:", owner);
        
        const root = await contract.currentMerkleRoot();
        console.log("Merkle Root:", root);
        
        // Test with CERT-001 data
        const leaf = "0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af";
        const proof = [
            "0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4",
            "0x4cf6e0dda32ea38319f599566d58eac76394ea6210b13c6f89e22444d6cc2731"
        ];
        
        const isValid = await contract.isValidCertificate(proof, leaf);
        console.log("Is CERT-001 valid?", isValid);
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();