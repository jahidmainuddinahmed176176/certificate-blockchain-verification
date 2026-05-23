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
  
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  const wallet = new ethers.Wallet(fullKey, provider);
  
  console.log(`Deployer address: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error("No ETH balance. Get free Sepolia ETH from a faucet.");
    process.exit(1);
  }
  
  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/CertificateVerificationFixed.sol/CertificateVerificationFixed.json", "utf8"));
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("Deploying CertificateVerificationFixed...");
  const contract = await factory.deploy();
  
  console.log("Waiting for deployment...");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`CertificateVerificationFixed deployed to: ${address}`);
  
  fs.writeFileSync("contract-address-fixed.txt", address);
  console.log("Address saved to contract-address-fixed.txt");
}

main().catch((error) => {
  console.error("Deployment failed:", error.message);
  process.exit(1);
});