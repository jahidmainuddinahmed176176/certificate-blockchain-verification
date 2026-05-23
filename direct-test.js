import { ethers } from "ethers";

async function main() {
    const CONTRACT_ADDRESS = "0x680c2450F26659c3df672Eb1f90255F216e5175D";
    
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    
    // Get the contract's root
    const rootABI = ["function currentMerkleRoot() view returns (bytes32)"];
    const rootContract = new ethers.Contract(CONTRACT_ADDRESS, rootABI, provider);
    const root = await rootContract.currentMerkleRoot();
    console.log("Contract root:", root);
    
    // Recompute root from the leaves manually
    const leaves = [
        "0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af",
        "0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4",
        "0xf48021de0d0821d236d81b27d41a914a0e292eea4afd724e48f038e66a1b01f3"
    ];
    
    // Sort leaves
    const sorted = [...leaves].sort();
    console.log("\nSorted leaves:", sorted);
    
    // Compute root manually
    function computeRoot(leaves) {
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
    
    const computedRoot = computeRoot(sorted);
    console.log("Computed root:", computedRoot);
    console.log("Match:", computedRoot === root ? "YES" : "NO");
    
    // Now test the proof for CERT-001
    const leaf = "0x12c108b512d99dbf8dee65fc8df5b76e45f98974e9a9b72910b171601bc525af";
    const proof = [
        "0x9f8b795d3dbde31d19f1e8dece07e3274c95a5a6933db947e5102b74417cf8e4",
        "0x4cf6e0dda32ea38319f599566d58eac76394ea6210b13c6f89e22444d6cc2731"
    ];
    
    // Manually verify the proof
    let computedHash = leaf;
    for (const proofElement of proof) {
        if (computedHash <= proofElement) {
            computedHash = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [computedHash, proofElement]
            );
        } else {
            computedHash = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [proofElement, computedHash]
            );
        }
    }
    
    console.log("\nManual verification:");
    console.log("  Leaf:", leaf);
    console.log("  Computed hash after proof:", computedHash);
    console.log("  Root:", root);
    console.log("  Valid:", computedHash === root);
}

main();