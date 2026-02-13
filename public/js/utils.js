const logOutputElement = document.getElementById("logOutput");
const studentSelect = document.getElementById("studentSelect");
const toastHost = document.getElementById("toastHost");

export function setLog(msg) {
    if (!logOutputElement) return;
    logOutputElement.innerHTML += msg + "<br/>";
    logOutputElement.scrollTop = logOutputElement.scrollHeight;
}

export function getSelectedStudentIdOrThrow() {
    const studentId = (studentSelect?.value || "").trim();
    if (!studentId) throw new Error("Select a student first");
    return studentId;
}

export function toast(message, opts = {}) {
    const timeout = 3000;
    
    const element = document.createElement("div");
    element.className = "toast";

    element.innerHTML = `
    <div class="top">
      <div class="msg">${message}</div>
      <button class="x" type="button" aria-label="Close">✕</button>
    </div>
    
    `;

    const close = () => {
        element.classList.add("hide");
        setTimeout(() => element.remove(), 160);
    };

    element.querySelector(".x").addEventListener("click", close);
    toastHost.appendChild(element);

    if (timeout > 0) setTimeout(close, timeout);

    return close;
}

export function getEvmProviders() {
   const out = [];

  const eth = window.ethereum;
  if (eth) {
    const providers = Array.isArray(eth.providers) ? eth.providers : [eth];
    for (const p of providers) {
      out.push({
        provider: p,
        name:
          (p.isMetaMask && "MetaMask") ||
          (p.isRabby && "Rabby") ||
          (p.isCoinbaseWallet && "Coinbase Wallet") ||
          (p.isTrust && "Trust Wallet") ||
          (p.isBraveWallet && "Brave Wallet") ||
          "EVM Wallet",
      });
    }
  }

  const phantomEvm = window.phantom?.ethereum;
  if (phantomEvm) {
    out.push({ provider: phantomEvm, name: "Phantom (EVM)" });
  }

  return out;
}

export async function pickEvmProvider() {
  const list = getEvmProviders();
  if (!list.length) return null;
  if (list.length === 1) return list[0].provider;

  const optionsText = list.map((x, i) => `${i + 1}) ${x.name}`).join("\n");
  const ans = prompt(`Choose wallet:\n${optionsText}\n\nType a number:`);

  const idx = Number(ans) - 1;
  if (!Number.isInteger(idx) || idx < 0 || idx >= list.length) return null;

  return list[idx].provider;
}