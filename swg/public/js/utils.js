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