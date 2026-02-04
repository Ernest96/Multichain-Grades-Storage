
import { CONFIG } from "../project.config.js";
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      type: "http",
      url: CONFIG.ethereum.rpcUrl,
      accounts: [CONFIG.ethereum.privateKey],
    },
    amoy: {
      type: "http",
      url: CONFIG.polygon.rpcUrl,
      accounts: [CONFIG.polygon.privateKey],
    },
  },
};