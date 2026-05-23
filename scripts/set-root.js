import { ethers } from "hardhat";

async function main() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const merkleRoot = "YOUR_MERKLE_ROOT_FROM_GENERATE_SCRIPT";
  
  const contract = await ethers.getContractAt("CertificateVerification", contractAddress);
  
  const tx = await contract.setMerkleRoot(merkleRoot);
  await tx.wait();
  
  console.log("Merkle root updated successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});