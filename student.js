import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= SOUND ================= */
const notifySound = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3"
);

/* ================= TOAST ================= */
function toast(msg, color = "#333") {
  notifySound.play().catch(() => {});
  const t = document.createElement("div");
  t.innerText = msg;
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
    box-shadow:0 8px 20px rgba(0,0,0,.3);
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ================= STATUS BADGE ================= */
function badge(status) {
  const colors = {
    Pending: "#f1c40f",
    "Marked Later": "#e67e22",
    "In Progress": "#3498db",
    Resolved: "#2ecc71",
    Rejected: "#e74c3c"
  };

  return `
    <span style="
      background:${colors[status] || "#999"};
      color:white;
      padding:4px 10px;
      border-radius:20px;
      font-size:12px;
      display:inline-block;
      margin-top:6px;
    ">${status}</span>
  `;
}

/* ================= BASE64 ================= */
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ================= GLOBALS ================= */
let chart = null;
let userEmail = null;

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {
  const issueInput = document.getElementById("issue");
  const imageInput = document.getElementById("image");
  const submitBtn = document.getElementById("submit");
  const historyDiv = document.getElementById("history");
  const chartCanvas = document.getElementById("issueChart");
  const logoutBtn = document.getElementById("logoutBtn");
  const statusFilter = document.getElementById("statusFilter");
  const downloadPdfBtn = document.getElementById("downloadPdf");

  /* ================= AUTH ================= */
  auth.onAuthStateChanged(user => {
    if (!user) {
      location.replace("index.html");
      return;
    }
    userEmail = user.email;
    listenIssues();
  });

  /* ================= SUBMIT ISSUE ================= */
  submitBtn.onclick = async () => {
    const text = issueInput.value.trim();
    const file = imageInput.files[0];

    if (!text) return toast("Enter issue", "#e74c3c");

    let base64 = "";
    if (file) base64 = await toBase64(file);

    await addDoc(collection(db, "issues"), {
      description: text,
      image: base64,
      status: "Pending",
      studentEmail: userEmail,
      createdAt: serverTimestamp(),
      notified: false
    });

    issueInput.value = "";
    imageInput.value = "";
    toast("Issue submitted ✅", "#2ecc71");
  };

  /* ================= LOGOUT ================= */
  logoutBtn.onclick = async () => {
    await signOut(auth);
    location.replace("index.html");
  };

  /* ================= FILTER CHANGE ================= */
  statusFilter.onchange = () => listenIssues();

  /* ================= PDF DOWNLOAD ================= */
  downloadPdfBtn.onclick = () => {
    html2pdf().from(historyDiv).save("my-issues.pdf");
  };

  /* ================= SNAPSHOT ================= */
  function listenIssues() {
    const q = query(
      collection(db, "issues"),
      where("studentEmail", "==", userEmail)
    );

    onSnapshot(q, snap => {
      historyDiv.innerHTML = "";

      let pending = 0, progress = 0, resolved = 0, rejected = 0;
      const filter = statusFilter.value;

      snap.forEach(d => {
        const i = d.data();

        if (filter !== "ALL" && i.status !== filter) return;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <b>${i.description}</b><br>
          ${badge(i.status)}
          ${i.image ? `<img src="${i.image}" style="max-width:150px;border-radius:8px;margin-top:8px">` : ""}
        `;
        historyDiv.appendChild(card);

        if (i.status === "Pending") pending++;
        else if (["In Progress", "Marked Later"].includes(i.status)) progress++;
        else if (i.status === "Resolved") resolved++;
        else rejected++;

        if (
          i.notified === false &&
          !["Pending", "Marked Later"].includes(i.status)
        ) {
          toast(`Issue ${i.status}`, "#27ae60");
          updateDoc(doc(db, "issues", d.id), { notified: true });
        }
      });

      renderChart(pending, progress, resolved, rejected);
    });
  }

  /* ================= CHART ================= */
  function renderChart(p, l, r, x) {
    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "pie",
      data: {
        labels: ["Pending", "Progress", "Resolved", "Rejected"],
        datasets: [{
          data: [p, l, r, x]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }
});
