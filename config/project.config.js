import "dotenv/config";

export const CONFIG = {
  polygon: {
    rpcUrl: "https://rpc-amoy.polygon.technology",
    privateKey: process.env.POL_PRIVATE_KEY,
    contractAddress: "0xA42984803c7d21FA453bde0527A5B9baF65235e6",
    chainIdHex: "0x13882"
  },
  ethereum: {
    rpcUrl: "https://sepolia.infura.io/v3/bd24e72571644461944188b92dfb02c5",
    privateKey: process.env.ETH_PRIVATE_KEY,
    contractAddress: "0x485f3119D4C0Be894A2220865ACc9a30861d3792",
    chainIdHex: "0xaa36a7"
  },
  solana: {
    rpcUrl: "https://api.devnet.solana.com",
    programId: "9cdrcYFonADBKCEgLFJfkTMBYAYUzdG61h58hMx1nnvP",
    idlSrc: "../blockchain/solana/target/idl/exam_grade_storage.json",
    idlDestName: "solana_idl.json",
  },
  security: {
    jwtDomain: process.env.JWT_DOMAIN,
    jwtSecret: process.env.JWT_SECRET,
    adminLogin: process.env.ADMIN_LOGIN,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
  swgApi: {
    host: process.env.SWG_API_HOST,
    port: Number(process.env.SWG_API_PORT),
    origin: getSwgApiOrigin(),
    cors: {
      allowOriginsExtra: [],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      allowCredentials: true,
    },
  },
  swg: {
    host: process.env.SWG_HOST,
    port: Number(process.env.SWG_PORT),
    origin: getSwgOrigin(),
    coop: "same-origin-allow-popups",
    coep: "require-corp",
    corp: "same-origin",
    csp: {
      base: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
        },
        connectSrc: [
          "https://sepolia.infura.io",
          "https://rpc-amoy.polygon.technology",
        ],
      },
      // route specific CSP
      routes: {
        "/": {
          connectAdd: [],
          scriptAdd: []
        },
      },
      // role specific CSP
      roles: {
        admin: {
          connectAdd: ["https://api.devnet.solana.com", "https://esm.sh", "wss://api.devnet.solana.com/"],
          scriptAdd: ["https://esm.sh"]
        },
      },
      // route + role specific CSP
      routeRoles: {
        "/": {
          admin: {
            connectAdd: [],
            scriptAdd: []
          },
        },
      },
    },
  },
};


function getSwgOrigin() {
  const origin = process.env.SWG_LIVE == 0 ?
    `${process.env.SWG_HOST}:${process.env.SWG_PORT}` :
    process.env.SWG_HOST;

  return origin;
}

function getSwgApiOrigin() {
  const origin = process.env.SWG_LIVE == 0 ?
    `${process.env.SWG_API_HOST}:${process.env.SWG_API_PORT}` :
    process.env.SWG_API_HOST;

  return origin;
}