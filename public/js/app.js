
import { loadStudents } from "./students.js";
import { isLoggedIn } from "./auth.js";


const modal = document.getElementById("loginModal");
const modalClose = document.getElementById("loginModalClose");
const modalCancel = document.getElementById("loginCancelBtn");

const logOutputElement = document.getElementById("logOutput");

const openLoginBtn = document.getElementById("openLoginBtn");
const reloadStudentsBtn = document.getElementById("reloadStudentsBtn");
const clearLogsBtn = document.getElementById("clearLogsBtn");

const logoutBtn = document.getElementById("logoutBtn");
const loginBtn = document.getElementById("openLoginBtn");

function openModal() {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  const user = document.getElementById("loginUser");
  user?.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function wireModal() {
  openLoginBtn?.addEventListener("click", openModal);
  modalClose?.addEventListener("click", closeModal);
  modalCancel?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeModal();
  });
}

function wireEvents() {
  reloadStudentsBtn?.addEventListener("click", loadStudents);
  clearLogsBtn?.addEventListener("click", () => {
    logOutputElement.innerHTML = "";
  });
}

function buildAdminUI() {
  const isLoggedInUser = isLoggedIn();

  if (isLoggedInUser) {
    loginBtn.hidden = true;
    logoutBtn.hidden = false;
  } else {
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
  }
}


async function startApp() {
  try {
    await loadStudents();
    wireModal();
    wireEvents();
    buildAdminUI();
  } catch (err) {
    console.error(err);
  }
}
startApp();
