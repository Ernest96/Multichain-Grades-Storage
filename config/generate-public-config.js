import fs from "fs";
import { CONFIG } from "./project.config.js";

const PUBLIC_CONFIG = {
  ethereum: {
    rpcUrl: CONFIG.ethereum.rpcUrl,
    contractAddress: CONFIG.ethereum.contractAddress,
  },
  polygon: {
    rpcUrl: CONFIG.polygon.rpcUrl,
    contractAddress: CONFIG.polygon.contractAddress,
  },
  solana: {
    rpcUrl: CONFIG.solana.rpcUrl,
  },
  swgApi: {
    origin: `${CONFIG.swgApi.host}:${CONFIG.swgApi.port}`,
  },
};

fs.writeFileSync(
  "../swg/public/js/public.config.js",
  `export const CONFIG_PUBLIC = ${JSON.stringify(PUBLIC_CONFIG, null, 2)};\n`
);

console.log("Public config generated");