// FILE: Frontend/auth/auth.js
/* ========= Helpers UI ========= */
function setBtnLoading(btn, isLoading, text = "") {
    if (!btn) return;
    if (isLoading) {
        btn.dataset._orig = btn.textContent;
        if (text) btn.textContent = text;
        btn.disabled = true;
        btn.classList.add("opacity-60", "pointer-events-none");
    } else {
        if (btn.dataset._orig) btn.textContent = btn.dataset._orig;
        btn.disabled = false;
        btn.classList.remove("opacity-60", "pointer-events-none");
    }
}
function showError(el, msg) {
    if (!el) return;
    if (msg) { el.textContent = msg; el.classList.remove("hidden"); }
    else { el.textContent = ""; el.classList.add("hidden"); }
}

/* ========= Lưu / đọc phiên ========= */
function saveSession({ token, user, remember = true }) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("token", token);
    store.setItem("user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
}

function getAuth() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const rawUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    let user = null;
    try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}
    return { token, user };
}

/* ========= Call API ========= */
async function apiRegister({ username, password, full_name }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, full_name }),
    });
    if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: "Đăng ký thất bại" }));
        throw new Error(e.detail || "Đăng ký thất bại");
    }
    return await res.json();
}

async function apiLogin({ username, password, role }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.detail || "Đăng nhập thất bại");
    }

    if (data.token && data.user) {
        saveSession(data);
    }
    return data;
}

/* ========= Navbar auth ========= */
function renderAuthNavbar(mount = document.getElementById("authMount")) {
    const { user } = getAuth();
    if (!mount) return;
    if (user) {
        mount.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm text-neutral-600 dark:text-neutral-300">${user.full_name || user.username}</span>
        <button id="btnLogout" class="px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-100">Đăng xuất</button>
      </div>`;
        document.getElementById("btnLogout")?.addEventListener("click", () => {
            logout();
            location.href = './auth/login.html';
        });
    } else {
        mount.innerHTML = `
      <a href="./auth/login.html" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Đăng nhập</a>
      <a href="./auth/register.html" class="px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-100 ml-2">Đăng ký</a>`;
    }
}

/* ========= Xuất global ========= */
window.authAPI = {
    apiLogin, apiRegister,
    saveSession, logout, getAuth,
    showError, setBtnLoading,
    renderAuthNavbar,
};