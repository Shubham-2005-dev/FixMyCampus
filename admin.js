import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ==========================
   CONFIG
========================== */
const ADMIN_EMAIL = "shubhamnaskar.cal@gmail.com";
let chart;

/* ==========================
   TOAST
========================== */
function toast(message, color = "#333") {
  const t = document.createElement("div");
  t.innerText = message;
  t.style.cssText = `
    position:fixed;
    bottom:20px;
    right:20px;
    background:${color};
    color:#fff;
    padding:12px 16px;
    border-radius:10px;
    z-index:9999;
    font-size:14px;
    box-shadow:0 8px 20px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ==========================
   AUTH GUARD (NO LOOP)
========================== */
auth.onAuthStateChanged((user) => {
  if (!user) {
    location.replace("index.html");
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    document.body.innerHTML = "<h2 style='text-align:center'>Admins only</h2>";
    return;
  }

  refreshAll();
});

/* ==========================
   LOAD ACTIVE ISSUES
========================== */
async function loadActiveIssues() {
  const issuesDiv = document.getElementById("issues");
  issuesDiv.innerHTML = "";

  const q = query(
    collection(db, "issues"),
    where("status", "==", "Pending")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    issuesDiv.innerHTML = "<p>No pending issues 🎉</p>";
    return;
  }

  snap.forEach((d) => {
    const i = d.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <b>${i.description}</b>
      <p>Status: ${i.status}</p>

      ${i.image ? `
        <img src="${i.image}"
             style="max-width:140px;margin-top:10px;border-radius:8px">
      ` : ""}

      <div style="margin-top:10px">
        <button onclick="resolveIssue('${d.id}')">✅ Resolve</button>
        <button onclick="rejectIssue('${d.id}')">❌ Reject</button>
      </div>
    `;

    issuesDiv.appendChild(card);
  });
}

/* ==========================
   ACTIONS
========================== */
window.resolveIssue = async (id) => {
  await updateDoc(doc(db, "issues", id), {
    status: "Resolved",
    resolvedAt: serverTimestamp(),
    notified: false
  });
  toast("Issue resolved", "#27ae60");
  refreshAll();
};

window.rejectIssue = async (id) => {
  await updateDoc(doc(db, "issues", id), {
    status: "Rejected",
    resolvedAt: serverTimestamp(),
    notified: false
  });
  toast("Issue rejected", "#c0392b");
  refreshAll();
};

/* ==========================
   HISTORY (ALL RESOLVED)
========================== */
async function loadHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  const snap = await getDocs(collection(db, "issues"));

  snap.forEach((d) => {
    const i = d.data();
    if (!i.resolvedAt) return;

    const p = document.createElement("p");
    p.innerText = `• ${i.description} (${i.status})`;
    historyDiv.appendChild(p);
  });
}

/* ==========================
   ANALYTICS PIE CHART
========================== */
async function loadChart() {
  let resolved = 0;
  let pending = 0;

  const snap = await getDocs(collection(db, "issues"));
  snap.forEach((d) => {
    d.data().status === "Resolved" ? resolved++ : pending++;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "pie",
    data: {
      labels: ["Resolved", "Pending"],
      datasets: [{
        data: [resolved, pending]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ==========================
   REFRESH ALL
========================== */
function refreshAll() {
  loadActiveIssues();
  loadHistory();
  loadChart();
}

/* ==========================
   LOGOUT
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    toast("Logged out 👋", "#e74c3c");
    setTimeout(() => {
      location.replace("index.html");
    }, 800);
  });
});
