import "dotenv/config";

export const CONFIG = {
  polygon: {
    rpcUrl: "https://rpc-amoy.polygon.technology",
    privateKey: process.env.POL_PRIVATE_KEY,
    contractAddress: "0xA42984803c7d21FA453bde0527A5B9baF65235e6",
  },

  ethereum: {
    rpcUrl: "https://sepolia.infura.io/v3/bd24e72571644461944188b92dfb02c5",
    privateKey: process.env.ETH_PRIVATE_KEY,
    contractAddress: "0x485f3119D4C0Be894A2220865ACc9a30861d3792",
  },

  solana: {
    rpcUrl: "https://api.devnet.solana.com",
    privateKey: process.env.SOLANA_PRIVATE_KEY,
    contractAddress: "",
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    adminLogin: process.env.ADMIN_LOGIN,
    adminPassword: process.env.ADMIN_PASSWORD,
  },

  swgApi: {
    host: process.env.SWG_API_HOST,
    port: Number(process.env.SWG_API_PORT),
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
        },
      },

      // role specific CSP
      roles: {
        admin: {
          connectAdd: ["https://api.devnet.solana.com"],
        },
      },

      // route + role specific CSP
      routeRoles: {
        "/": {
          admin: {
            connectAdd: [],
          },
        },
      },
    },
  },
};
