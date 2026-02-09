import { setLog, getSelectedStudentIdOrThrow, toast, pickEvmProvider } from "./utils.js";
import { CONFIG_PUBLIC } from "../public.config.js"

const ETH_RPC_URL = CONFIG_PUBLIC.ethereum.rpcUrl;
const ETH_CONTRACT_ADDRESS = CONFIG_PUBLIC.ethereum.contractAddress;

const ABI = [
  "function setMidTermGrade(string,uint8)",
  "function getMidTermGrade(string) view returns (uint8)",
  "function hasMidTermGrade(string) view returns (bool)"
];

const outputElement = document.getElementById("midGradeOutput");
const connectionBadgeText = document.querySelector("#ethereumChainBadge .badgeText");
const connectionBadgeDot = document.querySelector("#ethereumChainBadge .dot");
const gradeInputElement = document.getElementById("midGradeInput");

let browserProvider = null;
let signer = null;
let userAddress = null;
let evm = null;

const CHAIN = {
  key: "eth",
  label: "Ethereum Sepolia",
  chainIdHex: "0xaa36a7", // 11155111
  rpcUrl: ETH_RPC_URL,
  contract: ETH_CONTRACT_ADDRESS,
  addParams: {
    chainId: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    rpcUrls: [ETH_RPC_URL],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
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
  if (!evm) throw new Error("No EVM provider selected");
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
document.getElementById("ethereumConnectBtn").addEventListener("click", async () => {
  debugger;

  try {
    if (!window.ethereum) {
      toast("EVM Wallet not found");
      return;
    }


    evm = await pickEvmProvider();
    if (!evm) {
      toast("No wallet selected");
      return;
    }

    await ensureNetwork(evm, CHAIN.chainIdHex, CHAIN.addParams);
    await evm.request({ method: "eth_requestAccounts" });


    await refreshWalletState();
    setLog(`Ethereum Wallet connected. ${userAddress}`);

    connectionBadgeText.textContent = "connected";
    connectionBadgeDot.classList.add("green");

  } catch (e) {
    setLog(`Error: ${e?.message ?? e}`);
  }
});

// Read midterm grade (no wallet needed)
document.getElementById("midGradeReadBtn").addEventListener("click", async () => {
  try {
    const studentId = getSelectedStudentIdOrThrow();

    setLog(`Reading Midterm grade for ${studentId} from ${CHAIN.label}...`);

    const rp = new ethers.JsonRpcProvider(CHAIN.rpcUrl);
    const readContract = new ethers.Contract(CHAIN.contract, ABI, rp);

    const exists = await readContract.hasMidTermGrade(studentId);
    if (!exists) {
      outputElement.textContent = "(no grade yet)";
      setLog(`No midterm grade found for ${studentId}.`);
      return;
    }

    const grade = await readContract.getMidTermGrade(studentId);
    outputElement.textContent = `Midterm grade (${studentId}): ${grade.toString()}`;
    setLog(`Read OK from ${CHAIN.label}.`);
  } catch (e) {
    const msg = e?.message ?? e;
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});

// Set midterm grade (wallet needed)
document.getElementById("midGradeSetBtn").addEventListener("click", async () => {
  if (!evm) {
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
    await ensureNetwork(evm, CHAIN.chainIdHex, CHAIN.addParams);

    await refreshWalletState();

    const writeContract = new ethers.Contract(CHAIN.contract, ABI, signer);

    setLog(`Sending tx on ${CHAIN.label}...`);
    const tx = await writeContract.setMidTermGrade(studentId, gradeNum);
    toast(`TX sent: ${tx.hash}`);
    setLog(`TX sent: ${tx.hash}`);

    const receipt = await tx.wait();
    setLog(`Confirmed on ${CHAIN.label} in block: ${receipt.blockNumber}`);

    // optional: refresh output after write
    outputElement.textContent = `Midterm grade (${studentId}): ${gradeNum}`;
  } catch (e) {
    const msg = e?.message ?? e;
    setLog(`Error: ${msg}`);
    toast(msg);
  }
});