import { setLog, getSelectedStudentIdOrThrow, toast } from "./utils.js";
import { CONFIG_PUBLIC } from "../public.config.js";

// ---- UI elements ----
const outputElement = document.getElementById("examGradeOutput");
const gradeInputElement = document.getElementById("examGradeInput");

const connectBtn = document.getElementById("solanaConnectBtn");
const readBtn = document.getElementById("examReadBtn");
const setBtn = document.getElementById("examSetBtn");


const connectionBadgeText = document.querySelector("#solanaChainBadge .badgeText");
const connectionBadgeDot = document.querySelector("#solanaChainBadge .dot");


function getGradeOrThrow() {
  const v = Number((gradeInputElement?.value || "").trim());
  if (!Number.isInteger(v) || v < 0 || v > 10) {
    throw new Error("Grade must be an integer between 0 and 10");
  }
  return v;
}


// ---- Config ----
const SOL_RPC_URL = CONFIG_PUBLIC.solana.rpcUrl;
const SOL_PROGRAM_ID = CONFIG_PUBLIC.solana.programId;
const SOL_IDL_PATH = `./js/idl/${CONFIG_PUBLIC.solana.idlName}`;


// ---- Lazy-loaded libs (no bundler) ----
let web3 = null;
let anchor = null;
let program = null;
let connection = null;

async function loadSolanaLibs() {
  if (web3 && anchor) return;

  web3 = await import("https://esm.sh/@solana/web3.js@1.98.0");
  anchor = await import("https://esm.sh/@coral-xyz/anchor@0.32.1");
}

async function initProgramOrThrow() {
  await loadSolanaLibs();

  if (!SOL_PROGRAM_ID) throw new Error("Missing CONFIG_PUBLIC.solana.programId");
  if (!SOL_RPC_URL) throw new Error("Missing CONFIG_PUBLIC.solana.rpcUrl");
  if (!SOL_IDL_PATH) throw new Error("Missing CONFIG_PUBLIC.solana.idlPath");

  const idl = await fetch(SOL_IDL_PATH).then(r => {
    if (!r.ok) throw new Error(`Failed to load IDL: HTTP ${r.status}`);
    return r.json();
  });

  connection = new web3.Connection(SOL_RPC_URL, "confirmed");

  // Wallet (Phantom) adapter object for AnchorProvider
  const wallet = {
    get publicKey() {
      return window.solana?.publicKey ?? null;
    },
    signTransaction: (...args) => window.solana.signTransaction(...args),
    signAllTransactions: (...args) => window.solana.signAllTransactions(...args),
  };

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  program = new anchor.Program(idl, provider);
}

function getExamPda(studentId) {
  const programId = new web3.PublicKey(SOL_PROGRAM_ID);
  return web3.PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("exam_grade"), new TextEncoder().encode(studentId)],
    programId
  )[0];
}

// ---- Connect Phantom ----
connectBtn?.addEventListener("click", async () => {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      toast("Phantom wallet not found");
      return;
    }

    await initProgramOrThrow();

    // Request connect
    await window.solana.connect();

    const pubkey = window.solana.publicKey?.toBase58?.() ?? String(window.solana.publicKey);
    setLog(`Solana wallet connected. ${pubkey}`);

    connectionBadgeDot.classList.add("green");
    connectionBadgeText.textContent = "connected";

  } catch (e) {
    const msg = e?.message ?? String(e);
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});

// ---- Read exam grade (no wallet signing required) ----
readBtn?.addEventListener("click", async () => {
  try {
    await initProgramOrThrow();

    const studentId = getSelectedStudentIdOrThrow();
    setLog(`Reading Exam grade for ${studentId} from Solana...`);

    const pda = getExamPda(studentId);

    try {
      const acct = await program.account.examGradeAccount.fetch(pda);
      if (!acct.exists) {
        outputElement.textContent = "(no grade yet)";
        setLog(`No exam grade found for ${studentId}.`);
        return;
      }

      outputElement.textContent = `Exam grade (${studentId}): ${acct.value}`;
      setLog("Read OK (Solana).");
    } catch {
      // account does not exist yet
      outputElement.textContent = "(no grade yet)";
      setLog(`No exam grade account yet for ${studentId}.`);
    }
  } catch (e) {
    const msg = e?.message ?? String(e);
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});

// ---- Set exam grade (wallet signing required) ----
setBtn?.addEventListener("click", async () => {
  try {
    if (!window.solana?.publicKey) {
      toast("Connect Phantom first");
      return;
    }

    await initProgramOrThrow();

    const studentId = getSelectedStudentIdOrThrow();
    const grade = getGradeOrThrow();

    const pda = getExamPda(studentId);

    setLog(`Sending tx on Solana for ${studentId}...`);

    const sig = await program.methods
      .setExamGrade(studentId, grade)
      .accounts({
        authority: window.solana.publicKey,
        examGrade: pda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    toast(`TX sent: ${sig}`);
    setLog(`TX sent: ${sig}`);

    // Optional: wait for confirmation
    await connection.confirmTransaction(sig, "confirmed");
    setLog("Confirmed (Solana).");

    outputElement.textContent = `Exam grade (${studentId}): ${grade}`;
  } catch (e) {
    const msg = e?.message ?? String(e);
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});

