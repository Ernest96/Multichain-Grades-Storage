import { CONFIG_PUBLIC } from "../public.config.js"

const STUDENTS_API = `${CONFIG_PUBLIC.swgApi.origin}/api/students`;
const selectEl = document.getElementById("studentSelect");

export async function loadStudents() {
  const res = await fetch(STUDENTS_API, {
    credentials: "include"
  });

  if (!res.ok) throw new Error("Failed to load students");

  const data = await res.json();

  while (selectEl.options.length > 1) {
    selectEl.remove(1);
  }

  data.students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.id})`;
    selectEl.appendChild(opt);
  });
}

export function getSelectedStudentId() {
  return selectEl.value;
}
