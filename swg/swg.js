import "../config/env.js";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { setSecurityHeaders } from "./middleware/policies.middleware.js";
import { CONFIG } from "../config/project.config.js";

const app = express();
const PORT = CONFIG.swg.port;

const DAPP_ORIGIN = `${CONFIG.swg.host}:${CONFIG.swg.port}`;

app.use(express.json());
app.use(cookieParser());

// Apply SecurityHeaders
app.use(setSecurityHeaders);

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, () => {
  console.log(`SWG_UI running at ${DAPP_ORIGIN}`);
});
