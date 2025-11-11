// FILE: Frontend/js/router.js
const routes = {}; // Thay đổi: sẽ lưu trữ { render, cleanup }
let currentPath = null; // Biến để theo dõi route hiện tại

window.register = (path, viewConfig) => {
    // viewConfig có thể là một hàm (cách cũ) hoặc một object { render, cleanup }
    if (typeof viewConfig === 'function') {
        routes[path] = { render: viewConfig };
    } else {
        routes[path] = viewConfig;
    }
};

function renderRoute() {
    // 1. Dọn dẹp route cũ trước khi render route mới
    if (currentPath && routes[currentPath] && typeof routes[currentPath].cleanup === 'function') {
        routes[currentPath].cleanup();
    }

    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#/, "");
    currentPath = path; // Cập nhật route hiện tại

    const viewConfig = routes[path] || routes["/404"] || {
        render: () => {
            const el = $("#view");
            if (el) el.innerHTML = `<div class="card">Không tìm thấy trang: <b>${path}</b></div>`;
        }
    };
    
    // 2. Active menu
    $$(".navlink").forEach(a => {
        const r = a.getAttribute("data-route");
        a.classList.toggle("active", r === path);
    });

    // 3. Render route mới
    try {
        if (typeof viewConfig.render === 'function') {
            viewConfig.render();
        }
    } catch (e) {
        console.error("[router] render error", e);
        const el = $("#view");
        if (el) el.innerHTML = `<div class="card"><div class="text-red-600">Lỗi khi vẽ trang.</div><pre class="mt-2 text-xs">${(e && e.stack) || e}</pre></div>`;
    }
}

// ... (Phần còn lại của tệp router.js giữ nguyên không đổi) ...

// ====== SIDEBAR COLLAPSE + RESIZER ======
function applySidebar() {
  const collapsed = localStorage.getItem("sidebarCollapsed")==="1";
  const sidebar = $("#sidebar");
  if (sidebar) sidebar.classList.toggle("collapsed", collapsed);
}

document.addEventListener("DOMContentLoaded", ()=>{
  applySidebar();

  $("#collapseBtn")?.addEventListener("click", ()=>{
    const next = !(localStorage.getItem("sidebarCollapsed")==="1");
    localStorage.setItem("sidebarCollapsed", next ? "1":"0");
    applySidebar();
  });

  const resizer = $("#sidebarResizer");
  const sidebar = $("#sidebar");
  if (resizer && sidebar) {
    let drag = false, startX = 0, startW = 0;
    resizer.addEventListener("mousedown", (e)=>{
      drag = true; startX = e.clientX;
      startW = parseInt(getComputedStyle(sidebar).width,10);
      document.body.style.userSelect = "none";
    });
    window.addEventListener("mousemove", (e)=>{
      if (!drag) return;
      const w = Math.max(72, Math.min(480, startW + (e.clientX - startX)));
      sidebar.style.width = w+"px";
      document.documentElement.style.setProperty("--sidebar-width", w+"px");
    });
    window.addEventListener("mouseup", ()=>{
      if (!drag) return; drag = false;
      document.body.style.userSelect = "";
    });
  }

  // init icons
  window.lucide && window.lucide.createIcons();

  // first render
  renderRoute();
});

window.addEventListener("hashchange", renderRoute);
window.addEventListener("app-theme-changed", ()=> {
  // Repaint icons/charts khi đổi theme
  window.lucide && window.lucide.createIcons();
});

// ====== Trang mặc định ======
register("/", function HomeViewDefault() {
  const el = $("#view");
  if (!el) return;
  el.innerHTML = `
    <div class="card">
      <div class="flex items-center gap-2 text-lg font-semibold mb-1">
        <i data-lucide="badge-info"></i>
        Ứng dụng AI phân tích & phản hồi feedback sinh viên
      </div>
      <p class="muted">Chọn một mục ở menu trái để bắt đầu.</p>
    </div>`;
  window.lucide && window.lucide.createIcons();
});

// 404
register("/404", function NotFoundDefault() {
  const el = $("#view"); if (!el) return;
  el.innerHTML = `<div class="card"><b>404</b> – Trang không tồn tại.</div>`;
});