// FILE: Frontend/js/helpers.js
// ====== CONFIG ======
window.API_BASE = window.API_BASE || "http://127.0.0.1:8000";

// ====== HELPERS ======
window.$  = (s, r=document)=> r.querySelector(s);
window.$$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
window.showToast = (msg)=>{
  const t = document.querySelector("#toast"); // Sử dụng querySelector để không phụ thuộc $
  if (!t) return;
  t.textContent = msg; t.style.display = "block";
  setTimeout(()=> t.style.display = "none", 1600);
};