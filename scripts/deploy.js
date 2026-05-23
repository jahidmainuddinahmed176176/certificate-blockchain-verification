import { ethers } from "ethers";
import hre from "hardhat";
import fs from "fs";

async function main() {
  // Get the network name from Hardhat
  const networkName = hre.network.name;
  console.log(`Deploying to network: ${networkName}`);
  
  // Get the signer (account that will deploy)
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`Deployer address: ${deployerAddress}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Get contract factory and deploy
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  const contract = await CertificateVerification.deploy();
  
  console.log("Waiting for deployment...");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ CertificateVerification deployed to: ${address}`);
  
  // Save address
  fs.writeFileSync("contract-address.txt", address);
  console.log("Address saved to contract-address.txt");
}

main().catch((error) => {
  console.error("Deployment failed:", error.message);
  process.exitCode = 1;
});