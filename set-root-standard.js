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
  
  const contractAddress = "0x8795f60e40020edeC438f0b72108bF5Fb12805A8";
  const MERKLE_ROOT = "0x8916ddd2f05cdb7acc446fa2fc75bc9ebc3829d0ab0eb68c05c336d804530dc6";
  
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Merkle root to set: ${MERKLE_ROOT}`);
  
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const wallet = new ethers.Wallet(fullKey, provider);
  
  console.log(`Wallet: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/StandardMerkleVerification.sol/StandardMerkleVerification.json", "utf8"));
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);
  
  console.log("Setting Merkle root...");
  const tx = await contract.setMerkleRoot(MERKLE_ROOT);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  await tx.wait();
  console.log("Merkle root set successfully!");
  
  const currentRoot = await contract.merkleRoot();
  console.log(`Current Merkle root in contract: ${currentRoot}`);
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});