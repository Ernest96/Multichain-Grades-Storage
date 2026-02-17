# Multichain Grades Storage — Semantic Web Gateway Demo

A practical demonstration of interoperable multichain applications using a Semantic Web Gateway (SWG) architecture, where off-chain academic identities interact with on-chain grade storage across multiple blockchain ecosystems.

The system showcases how a single web interface can securely read and write academic records distributed across heterogeneous blockchain networks.

Live demo: [https://grades.ernestbitca.com/](https://grades.ernestbitca.com/) 

![image](https://github.com/user-attachments/assets/3d1869b6-887a-4442-9115-2ff24ad2ff8e)


---

## Overview

This project implements a multichain academic records prototype:

- Polygon (Amoy) — Lab grades storage  
- Ethereum (Sepolia) — Midterm grades storage  
- Solana (Devnet) — Exam grades storage  
- SWG (Semantic Web Gateway) — policy-enforced secure HTTP interface and identity gateway  
- SWG API — authentication, students registry, and role-based access control  

All chains are accessed through a unified frontend, demonstrating a real-world cross-chain data governance model.

---

## Architecture

- Frontend (Browser UI)  
- Semantic Web Gateway (SWG)    
- SWG API (Off Chain data & Authorization)  
- Blockchains  
    - Ethereum Smart Contract  
    - Polygon Smart Contract  
    - Solana Program  

The architecture separates identity and access control (off-chain), data integrity and persistence (on-chain), and policy enforcement and interoperability (gateway layer).

---

## Key Features

- Multichain smart contract integration (EVM + Solana)
- CSP-hardened Semantic Web Gateway security layer
- Role-based admin authorization
- Wallet-agnostic frontend (MetaMask / Rabby / Coinbase / Phantom)
- Deterministic student identity mapping across chains

---

## HTTP Policies Configuration

The Semantic Web Gateway (SWG) implements a strict browser-side and gateway-level security model designed to safely enable multichain interactions directly from the frontend while preserving strong origin isolation and minimizing cross-origin attack surfaces.

The SWG dynamically generates headers based on:
- application route
- authenticated user role (guest / admin)
- blockchain RPC endpoints required for runtime interactions

```js
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
```
---

## Running the project

Before running the project:

1. Configure the file `config/project.config.js` according to your environment (RPC URLs, contract addresses, ports, etc.).

2. Create a `.env` file inside the `config/` directory and define the required environment variables, for example:

```bash
SWG_LIVE=0
ETH_PRIVATE_KEY=
POL_PRIVATE_KEY=
JWT_DOMAIN=localhost
JWT_SECRET=
ADMIN_LOGIN=
ADMIN_PASSWORD=
SWG_API_HOST=http://localhost
SWG_API_PORT=3001
SWG_HOST=http://localhost
SWG_PORT=3000
```

3. Download, build dependencies, generate public config and start the app:

### For local:

```bash
sh ./start-local.sh
```

### For Docker:

The project includes Dockerfiles and docker-compose configuration for running SWG and SWG API as containers.


```bash
sh ./start-docker.sh
```

Then open the application in the browser at:

http://localhost:PORT

---

## Smart Contracts Deployement

This project includes an example of deployed smart contracts. You do not need to redeploy them to use the app.
The project uses Sepolia, Amoy and Solana devnet.

### Ethereum, Polygon

1. Navigate to ethereum_polygon folder

```bash
cd  blockchain/ethereum_polygon
```

2. Install dependencies

```bash
npm init -y
npm i -D hardhat@hh2 @nomicfoundation/hardhat-ethers@hh2
```

3. Configure RPC urls and Private Keys in config/project.config.js and config/.env

4. Compile .sol contracts

```bash
npx hardhat compile
```

5. Deploy Ethereum smart-contract

```bash
npx hardhat run scripts/deploy-midterm.js --network sepolia
```

6. Deploy Polygon smart-contract

```bash
npx hardhat run scripts/deploy-lab.js --network amoy
```

### Solana

Create a local wallet before doing this. You have the privat key on your machine already.

1. Navigate to solana folder

```bash
cd blockchain/solana
```

2. Change to devnet

```bash
solana config set --url https://api.devnet.solana.com
```

3. Build smart contract

```bash
anchor build
```

4. Deploy smart contract (do not forget to update program id)

```bash
anchor deploy --provider.cluster devnet
```

---

## Tech Stack

- CSP / CORS / COOP / COEP security policies
- Solidity (Ethereum / Polygon)
- Rust + Anchor (Solana)
- Node.js (SWG & API)
- Ethers.js
- Solana Web3.js + Anchor JS
- JWT authentication


---

## Research Context

This prototype supports research on multichain interoperability and secure semantic gateways.

