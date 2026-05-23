import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("No PRIVATE_KEY in .env");
    process.exit(1);
  }

  const fullKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  
  const contractAddress = "0x44e415bc9C4bA95C8eD42Be5D1641E19F1E8Bf50";
  const NEW_MERKLE_ROOT = "0xe390c7ce3538b80da56b9259857295fbad23f3c6c01f8da276a39d4ff0eeb9b2";
  
  console.log(`Contract address: ${contractAddress}`);
  console.log(`New Merkle root to set: ${NEW_MERKLE_ROOT}`);
  
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const wallet = new ethers.Wallet(fullKey, provider);
  
  console.log(`Wallet: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/CertificateVerificationFixed.sol/CertificateVerificationFixed.json", "utf8"));
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);
  
  console.log("Setting Merkle root...");
  const tx = await contract.setMerkleRoot(NEW_MERKLE_ROOT);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  await tx.wait();
  console.log("Merkle root set successfully!");
  
  const currentRoot = await contract.currentMerkleRoot();
  console.log(`Current Merkle root in contract: ${currentRoot}`);
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});