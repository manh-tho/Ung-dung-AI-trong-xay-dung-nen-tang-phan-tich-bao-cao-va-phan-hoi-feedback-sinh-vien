// FILE: Frontend/js/history.js
async function HistoryView() {
  const { user } = authAPI.getAuth();
  const isAdmin = user && user.role === "admin";

  document.getElementById("view").innerHTML = `
    <div class="max-w-6xl mx-auto">
      <div class="card p-6 shadow-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold tracking-tight">
              ${isAdmin ? "📊 Lịch sử Toàn bộ Feedback" : "🕒 Lịch sử Gửi Feedback của bạn"}
            </h2>
            <p class="text-sm text-neutral-500 mt-1">Dùng ô <b>"Tìm feedback..."</b> ở góc phải để lọc kết quả.</p>
          </div>
          <button id="refreshBtn" class="btn btn-primary gap-2 flex items-center">
            <i data-lucide="refresh-ccw" class="w-4 h-4"></i> Làm mới
          </button>
        </div>

        <div class="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 font-semibold">Thời gian</th>
                ${isAdmin ? '<th class="px-4 py-3 font-semibold">Người gửi</th>' : ""}
                <th class="px-4 py-3 font-semibold">Chủ đề</th>
                <th class="px-4 py-3 font-semibold">Cảm xúc</th>
                <th class="px-4 py-3 font-semibold">Nội dung</th>
                <th class="px-4 py-3 font-semibold text-center">Ảnh</th>
              </tr>
            </thead>
            <tbody id="historyBody" class="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900"></tbody>
          </table>
        </div>

        <div id="noData" class="hidden text-center py-10 text-neutral-500 text-sm italic">
          Không có dữ liệu phản hồi nào được tìm thấy.
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const tbody = document.getElementById("historyBody");
  const noData = document.getElementById("noData");
  const refreshBtn = document.getElementById("refreshBtn");

  const fmt = (ts) => ts || "";
  const mapS = (s) =>
    s === "POS" ? "Tích cực" : s === "NEG" ? "Tiêu cực" : "Trung lập";

  async function loadHistory() {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-neutral-400">Đang tải dữ liệu...</td></tr>`;
    try {
      const { token } = authAPI.getAuth();
      if (!token) throw new Error("Chưa đăng nhập");

      const apiUrl = isAdmin
        ? `${API_BASE}/feedbacks`
        : `${API_BASE}/feedbacks/me`;

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải lịch sử");
      const data = await res.json();

      window._cachedData = data;
      renderTable(data);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
  }

  function renderTable(data, filter = "") {
    tbody.innerHTML = "";
    const q = (filter || "").toLowerCase();
    let count = 0;

    data.forEach((f) => {
      const text = `${f.txt} ${f.cat} ${f.senti} ${isAdmin ? f.user || "" : ""}`.toLowerCase();
      if (q && !text.includes(q)) return;
      count++;

      const sentiClass =
        f.senti === "POS"
          ? "text-green-600 dark:text-green-400 font-semibold"
          : f.senti === "NEG"
          ? "text-red-600 dark:text-red-400 font-semibold"
          : "text-yellow-600 dark:text-yellow-400 font-medium";

      // === Nút ảnh: có ảnh -> xanh, không có -> xám ===
      const hasImg = !!f.img;
      const imgBtn = hasImg
        ? `<a href="${API_BASE}${f.img}" target="_blank"
             class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg
                    bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150">
              <i data-lucide="image" class="w-4 h-4 mr-1"></i>Xem
           </a>`
        : `<button disabled
             class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg
                    bg-gray-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-70">
              <i data-lucide="image-off" class="w-4 h-4 mr-1"></i>Không có
           </button>`;

      const row = `
        <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
          <td class="px-4 py-3 whitespace-nowrap">${fmt(f.ts)}</td>
          ${isAdmin ? `<td class="px-4 py-3 whitespace-nowrap">${f.user || "Ẩn danh"}</td>` : ""}
          <td class="px-4 py-3">${f.cat}</td>
          <td class="px-4 py-3 ${sentiClass}">${mapS(f.senti)}</td>
          <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">${f.txt}</td>
          <td class="px-4 py-3 text-center">${imgBtn}</td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    if (window.lucide) window.lucide.createIcons();
    noData.classList.toggle("hidden", count > 0);
  }

  // Gắn event tìm kiếm toàn cục
  const searchHandler = (e) =>
    renderTable(window._cachedData || [], e.detail.q || "");
  window.addEventListener("app-search", searchHandler);

  // Cleanup khi rời route
  if (!window.routeCleanupFunctions) window.routeCleanupFunctions = {};
  window.routeCleanupFunctions["/history"] = () =>
    window.removeEventListener("app-search", searchHandler);

  // Làm mới
  refreshBtn.addEventListener("click", loadHistory);

  // Tải lần đầu
  await loadHistory();
}
register("/history", HistoryView);
