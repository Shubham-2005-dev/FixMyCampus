import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8Ie9hD6UZ24YssoSsdvPrasPjBk2FC1k",
  authDomain: "fixmycampus-12b36.firebaseapp.com",
  projectId: "fixmycampus-12b36",
  storageBucket: "fixmycampus-12b36.appspot.com",
  messagingSenderId: "494634139652",
  appId: "1:494634139652:web:f19ba812e10a90615ff551"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
