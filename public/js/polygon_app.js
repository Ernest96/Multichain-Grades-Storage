import { setLog, getSelectedStudentIdOrThrow, toast, pickEvmProvider } from "./utils.js";
import { CONFIG_PUBLIC } from "../public.config.js";

const POL_RPC_URL = CONFIG_PUBLIC.polygon.rpcUrl;
const POL_CONTRACT_ADDRESS = CONFIG_PUBLIC.polygon.contractAddress;
const POL_IDX_HEX = CONFIG_PUBLIC.polygon.chainIdHex;

const ABI = [
  "function setLabGrade(string,uint8)",
  "function getLabGrade(string) view returns (uint8)",
  "function hasLabGrade(string) view returns (bool)"
];

const outputElement = document.getElementById("labGradeOutput");
const connectionBadgeText = document.querySelector("#polygonChainBadge .badgeText");
const connectionBadgeDot = document.querySelector("#polygonChainBadge .dot");
const gradeInputElement = document.getElementById("labGradeInput");
const setBtn = document.getElementById("labSetBtn");
const readBtn = document.getElementById("labReadBtn");
const connectBtn = document.getElementById("polygonConnectBtn");


let browserProvider = null;
let signer = null;
let userAddress = null;
let evm = null;

const CHAIN = {
  key: "pol",
  label: "Polygon",
  chainIdHex: POL_IDX_HEX,
  rpcUrl: POL_RPC_URL,
  contract: POL_CONTRACT_ADDRESS,
  addParams: {
    chainId: POL_IDX_HEX,
    chainName: "Polygon",
    rpcUrls: [POL_RPC_URL],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 }
  },
};

function getGradeOrThrow() {
  const v = Number((gradeInputElement.value || "").trim());
  if (!Number.isInteger(v) || v < 0 || v > 10) {
    throw new Error("Grade must be an integer between 0 and 10");
  }
  return v;
}

async function refreshWalletState() {
  browserProvider = new ethers.BrowserProvider(evm);
  signer = await browserProvider.getSigner();
  userAddress = await signer.getAddress();
}

async function ensureNetwork(provider, targetChainIdHex, addParams) {
  const current = await provider.request({ method: "eth_chainId" });
  if (current === targetChainIdHex) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainIdHex }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [addParams],
      });
    } else {
      throw err;
    }
  }
}

// Connect wallet
connectBtn?.addEventListener("click", async () => {
  try {
    evm = await pickEvmProvider();
    if (!evm) {
      toast("No wallet selected");
      return;
    }

    await ensureNetwork(evm, CHAIN.chainIdHex, CHAIN.addParams);
    await evm.request({ method: "eth_requestAccounts" });

    await refreshWalletState();
    setLog(`Polygon Wallet connected. ${userAddress}`);

    connectionBadgeText.textContent = "connected";
    connectionBadgeDot.classList.add("green");

  } catch (e) {
    setLog(`Error: ${e?.message ?? e}`);
  }
});

// Read lab grade
readBtn?.addEventListener("click", async () => {
  try {
    const studentId = getSelectedStudentIdOrThrow();

    setLog(`Reading Lab grade for ${studentId} from ${CHAIN.label}...`);

    const rp = new ethers.JsonRpcProvider(CHAIN.rpcUrl);
    const readContract = new ethers.Contract(CHAIN.contract, ABI, rp);

    const exists = await readContract.hasLabGrade(studentId);
    if (!exists) {
      outputElement.textContent = "(no grade yet)";
      setLog(`No lab grade found for ${studentId}.`);
      return;
    }

    const grade = await readContract.getLabGrade(studentId);
    outputElement.textContent = `Lab grade (${studentId}): ${grade.toString()}`;
    setLog(`Read OK from ${CHAIN.label}.`);
  } catch (e) {
    const msg = e?.message ?? e;
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});

// Set lab grade
setBtn?.addEventListener("click", async () => {
  if (!evm || !signer) {
    toast("Connect wallet first");
    return;
  }

  try {
    const studentId = getSelectedStudentIdOrThrow();
    const gradeNum = getGradeOrThrow();

    setLog(`Switching to ${CHAIN.label} (if needed)...`);
    await ensureNetwork(evm, CHAIN.chainIdHex, CHAIN.addParams);

    await refreshWalletState();

    const writeContract = new ethers.Contract(CHAIN.contract, ABI, signer);

    setLog(`Sending tx on ${CHAIN.label}...`);
    const tx = await writeContract.setLabGrade(studentId, gradeNum);

    toast(`TX sent: ${tx.hash}`);
    setLog(`TX sent: ${tx.hash}`);

    const receipt = await tx.wait();
    setLog(`Confirmed on ${CHAIN.label} in block: ${receipt.blockNumber}`);

    outputElement.textContent = `Lab grade (${studentId}): ${gradeNum}`;
  } catch (e) {
    const msg = e?.message ?? e;
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});
