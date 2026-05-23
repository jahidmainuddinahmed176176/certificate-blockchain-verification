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
  
  // Read contract address
  const contractAddress = fs.readFileSync("contract-address.txt", "utf8").trim();
  console.log(`Contract address: ${contractAddress}`);
  
  const MERKLE_ROOT = "0x528ef768da53a073e7452f3bec232f0c00afa1d66b65efe73f0f36c033fa23dc";
  console.log(`Merkle root to set: ${MERKLE_ROOT}`);
  
  // Try multiple public RPC endpoints
  const rpcUrls = [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://sepolia.gateway.tenderly.co",
    "https://rpc.sepolia.ethpandaops.io",
    "https://1rpc.io/sepolia"
  ];
  
  let provider = null;
  for (const url of rpcUrls) {
    try {
      console.log(`Trying RPC: ${url}`);
      provider = new ethers.JsonRpcProvider(url);
      await provider.getNetwork();
      console.log(`✅ Connected to ${url}`);
      break;
    } catch (e) {
      console.log(`Failed: ${url}`);
    }
  }
  
  if (!provider) {
    console.error("No working RPC endpoint found");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(fullKey, provider);
  console.log(`Wallet: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Get contract ABI
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/CertificateVerification.sol/CertificateVerification.json", "utf8"));
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);
  
  console.log("Setting Merkle root...");
  const tx = await contract.setMerkleRoot(MERKLE_ROOT);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  await tx.wait();
  console.log("✅ Merkle root set successfully!");
  
  const currentRoot = await contract.currentMerkleRoot();
  console.log(`Current Merkle root: ${currentRoot}`);
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});