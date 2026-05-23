import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      type: "http",
      url: "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
    },
  },
};