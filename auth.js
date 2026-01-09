import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

const ADMIN_EMAILS = [
  "shubhamnaskar.cal@gmail.com"
];

// Login button
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert(e.message);
  }
});

// Redirect AFTER auth is stable
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  if (ADMIN_EMAILS.includes(user.email)) {
    window.location.replace("admin.html");
  } else {
    window.location.replace("student.html");
  }
});
