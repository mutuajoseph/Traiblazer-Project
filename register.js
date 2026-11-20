"use strict";
const byId = (id) => document.getElementById(id);
const pad = (number) => String(number).padStart(2, "0");
const blankStudent = (name) => ({ name, status: "Unmarked" });
const today = new Date();
let register = {
  version: 1,
  title: "Form 3A",
  day: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
  students: [
    "Amelia Brooks",
    "Benjamin Carter",
    "Charlotte Davis",
    "Daniel Evans",
    "Ella Foster",
    "Ethan Grant",
    "Grace Harris",
    "Henry James",
    "Isabella King",
    "Jack Lewis",
    "Mia Parker",
    "Noah Wilson",
  ].map(blankStudent),
};
let dirty = false;
const message = (text) => {
  byId("message").textContent = text;
};
const statuses = ["Present", "Absent", "Unmarked"];
function resetFilters() {
  byId("search").value = "";
  byId("filter").selectedIndex = 0;
}
function renderRows() {
  const query = byId("search").value.trim().toLowerCase();
  const filter = byId("filter").value;
  const rows = document.createDocumentFragment();
  register.students.forEach(({ name, status }, i) => {
    if (
      !name.toLowerCase().includes(query) ||
      (filter !== "All statuses" && status !== filter)
    )
      return;
    const row = byId("student-row").content.firstElementChild.cloneNode(true);
    row.dataset.index = i;
    row.querySelector(".num").textContent = pad(i + 1);
    row.querySelector("strong").textContent = name;
    const avatar = row.querySelector(".avatar");
    avatar.classList.add(`a${i % 6}`);
    avatar.textContent = name
      .trim()
      .split(/\s+/)
      .filter((_, j, a) => j === 0 || j === a.length - 1)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    for (const button of row.querySelectorAll("button")) {
      button.setAttribute("aria-label", `${name}: ${button.dataset.status}`);
      button.setAttribute(
        "aria-pressed",
        String(status === button.dataset.status),
      );
    }
    rows.append(row);
  });
  document.querySelector(".empty").hidden = rows.childElementCount !== 0;
  byId("rows").replaceChildren(rows);
}
function render() {
  const count = register.students.length;
  byId("date").value = register.day;
  byId("date-label").textContent = new Date(
    register.day + "T12:00:00",
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  byId("class-title").textContent = register.title;
  byId("class-count").textContent = `${count} students`;
  byId("total").textContent = pad(count);
  for (const status of statuses)
    byId(status).textContent = pad(
      register.students.filter((s) => s.status === status).length,
    );
  byId("marked").textContent =
    `${count - Number(byId("Unmarked").textContent)} of ${count} students marked`;
  renderRows();
}
byId("rows").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-status]");
  if (!button) return;
  const index = button.closest(".student").dataset.index;
  const student = register.students[index];
  student.status =
    student.status === button.dataset.status
      ? "Unmarked"
      : button.dataset.status;
  dirty = true;
  message("");
  render();
  byId("rows")
    .querySelector(
      `[data-index="${index}"] [data-status="${button.dataset.status}"]`,
    )
    ?.focus({ preventScroll: true });
});
byId("search").addEventListener("input", renderRows);
byId("filter").addEventListener("change", renderRows);
byId("date").addEventListener("change", () => {
  if (byId("date").value) {
    register.day = byId("date").value;
    dirty = true;
  }
  render();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key !== "/" ||
    byId("editor").open ||
    e.target.matches("input,select,textarea")
  )
    return;
  e.preventDefault();
  byId("search").focus();
});
window.addEventListener("beforeunload", (e) => {
  if (dirty) e.preventDefault();
});
byId("edit").onclick = () => {
  byId("title-input").value = register.title;
  byId("names-input").value = register.students.map((s) => s.name).join("\n");
  byId("roster-error").textContent = "";
  byId("editor").showModal();
};
byId("close").onclick = () => byId("editor").close();
byId("roster-form").onsubmit = (event) => {
  event.preventDefault();
  const names = byId("names-input")
    .value.split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  const title = byId("title-input").value.trim();
  if (
    !title ||
    !names.length ||
    names.length > 500 ||
    names.some((n) => n.length > 100)
  ) {
    byId("roster-error").textContent =
      "Use 1–500 names, up to 100 characters each, and a class name.";
    return;
  }
  const previous = [...register.students];
  register.students = names.map((name) => {
    const index = previous.findIndex((s) => s.name === name);
    return index < 0 ? blankStudent(name) : previous.splice(index, 1)[0];
  });
  register.title = title;
  dirty = true;
  resetFilters();
  render();
  byId("editor").close();
  message("Class roster updated. Download your register to keep the changes.");
};
byId("save").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(register, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${register.title}-${register.day}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  dirty = false;
  message("Register downloaded. Choose Open register to continue it later.");
};
function validRegister(data) {
  return (
    data?.version === 1 &&
    typeof data.title === "string" &&
    data.title.trim() &&
    data.title.length <= 80 &&
    typeof data.day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.day) &&
    !Number.isNaN(Date.parse(data.day)) &&
    new Date(data.day).toISOString().slice(0, 10) === data.day &&
    Array.isArray(data.students) &&
    data.students.length > 0 &&
    data.students.length <= 500 &&
    data.students.every(
      (s) =>
        typeof s?.name === "string" &&
        s.name.trim() &&
        s.name.length <= 100 &&
        statuses.includes(s.status),
    )
  );
}
byId("open").onclick = () => byId("file").click();
byId("file").onchange = async (event) => {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  try {
    if (file.size > 1000000) throw Error();
    const data = JSON.parse(await file.text());
    if (!validRegister(data)) throw Error();
    if (dirty && !confirm("Replace the unsaved attendance in this tab?"))
      return;
    register = {
      version: 1,
      title: data.title,
      day: data.day,
      students: data.students.map(({ name, status }) => ({ name, status })),
    };
    dirty = false;
    resetFilters();
    render();
    message("Register opened.");
  } catch {
    message(
      "Could not open this file. Choose a register downloaded from Rollmark.",
    );
  }
};
render();
