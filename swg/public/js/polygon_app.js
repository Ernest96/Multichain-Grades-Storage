import { setLog, getSelectedStudentIdOrThrow, toast } from "./utils.js";
import { CONFIG_PUBLIC } from "./public.config.js"

const POL_RPC_URL = CONFIG_PUBLIC.polygon.rpcUrl;
const POL_CONTRACT_ADDRESS = CONFIG_PUBLIC.polygon.contractAddress;

const ABI = [
  "function setLabGrade(string,uint8)",
  "function getLabGrade(string) view returns (uint8)",
  "function hasLabGrade(string) view returns (bool)"
];

const outputElement = document.getElementById("labGradeOutput");
const connectionBadgeText = document.querySelector("#polygonChainBadge .badgeText");
const connectionBadgeDot = document.querySelector("#polygonChainBadge .dot");
const gradeInputElement = document.getElementById("labGradeInput");

let browserProvider = null;
let signer = null;
let userAddress = null;

const CHAIN = {
  key: "pol",
  label: "Polygon Amoy",
  chainIdHex: "0x13882", // 80002
  rpcUrl: POL_RPC_URL,
  contract: POL_CONTRACT_ADDRESS,
  addParams: {
    chainId: "0x13882",
    chainName: "Polygon Amoy",
    rpcUrls: [POL_RPC_URL],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
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
  browserProvider = new ethers.BrowserProvider(window.ethereum);
  signer = await browserProvider.getSigner();
  userAddress = await signer.getAddress();
}

async function ensureNetwork(targetChainIdHex, addParams) {
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current === targetChainIdHex) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainIdHex }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [addParams],
      });
    } else {
      throw err;
    }
  }
}

// Connect wallet
document.getElementById("polygonConnectBtn").addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      toast("EVM Wallet not found");
      return;
    }

    await ensureNetwork(CHAIN.chainIdHex, CHAIN.addParams);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    await refreshWalletState();
    setLog(`Polygon Wallet connected. ${userAddress}`);
    connectionBadgeText.textContent = "connected";
    connectionBadgeDot.classList.add("green");
  } catch (e) {
    setLog(`Error: ${e?.message ?? e}`);
  }
});

// Read lab grade (no wallet needed)
document.getElementById("labReadBtn").addEventListener("click", async () => {
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

// Set lab grade (wallet needed)
document.getElementById("labSetBtn").addEventListener("click", async () => {
  if (!window.ethereum) {
    toast("MetaMask not found");
    return;
  }
  if (!signer) {
    toast("Connect wallet first");
    return;
  } 

  try {
    const studentId = getSelectedStudentIdOrThrow();
    const gradeNum = getGradeOrThrow();

    setLog(`Switching to ${CHAIN.label} (if needed)...`);
    await ensureNetwork(CHAIN.chainIdHex, CHAIN.addParams);

    await refreshWalletState();

    const writeContract = new ethers.Contract(CHAIN.contract, ABI, signer);

    setLog(`Sending tx on ${CHAIN.label}...`);
    const tx = await writeContract.setLabGrade(studentId, gradeNum);
    toast(`TX sent: ${tx.hash}`);
    setLog(`TX sent: ${tx.hash}`);

    const receipt = await tx.wait();
    setLog(`Confirmed on ${CHAIN.label} in block: ${receipt.blockNumber}`);

    // optional: refresh output after write
    outputElement.textContent = `Lab grade (${studentId}): ${gradeNum}`;
  } catch (e) {
    const msg = e?.message ?? e;
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});
