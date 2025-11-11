// FILE: Frontend/js/topics.js
function TopicsView() {
  const mount = document.getElementById("view");
  mount.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2">Chủ đề nổi bật</h2>
        <p class="muted">AI sẽ tự động phát hiện các chủ đề phản hồi khi có dữ liệu đủ lớn.</p>
      </div>

      <div id="topicCard" class="card p-6">
        <div id="topicLoading" class="text-center py-10 text-neutral-500">Đang phân tích dữ liệu...</div>
        <div id="topicEmpty" class="hidden text-center py-10 text-neutral-500">
          Chưa đủ dữ liệu để hiển thị. Hãy thu thập thêm phản hồi nhé.
        </div>
        <div id="topicGrid" class="hidden grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      </div>
    </div>
  `;

  (async () => {
    const loadingEl = document.getElementById("topicLoading");
    const emptyEl   = document.getElementById("topicEmpty");
    const gridEl    = document.getElementById("topicGrid");

    try {
      const { user, token } = authAPI.getAuth();
      const isAdmin = user && user.role === "admin";
      const apiUrl = isAdmin ? `${API_BASE}/feedbacks` : `${API_BASE}/feedbacks/me`;

      const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Không thể tải dữ liệu");
      const data = await res.json();

      // --- Tổng hợp theo chủ đề (cat) ---
      const counter = new Map(); // cat -> count
      (data || []).forEach(f => {
        const cat = (f.cat || "Khác").trim();
        counter.set(cat, (counter.get(cat) || 0) + 1);
      });

      // Ngưỡng hiển thị
      const total = data.length;
      const MIN_TOTAL = 10; // tổng feedback tối thiểu
      const MIN_PER_TOPIC = 3; // số lần xuất hiện tối thiểu cho 1 topic

      // Lọc các topic nổi bật
      const topics = Array.from(counter.entries())
        .map(([cat, count]) => ({ cat, count }))
        .sort((a, b) => b.count - a.count)
        .filter(t => t.count >= MIN_PER_TOPIC || total >= MIN_TOTAL);

      loadingEl.classList.add("hidden");

      if (!topics.length) {
        emptyEl.classList.remove("hidden");
        return;
      }

      gridEl.classList.remove("hidden");
      gridEl.innerHTML = topics.map(t => {
        // màu nhẹ tuỳ theo độ nổi bật
        const intensity = Math.min(100, 20 + t.count * 10); // 20..100
        return `
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 hover:shadow-sm transition">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-sm text-neutral-500">Chủ đề</div>
                <div class="text-lg font-semibold">${t.cat}</div>
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                    style="background: rgba(59,130,246,${intensity/100}); color: #0b1437;">
                ${t.count} phản hồi
              </span>
            </div>
            <div class="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Xuất hiện <b>${t.count}</b> lần trong dữ liệu gần đây.
            </div>
          </div>
        `;
      }).join("");
    } catch (e) {
      loadingEl.textContent = `Lỗi: ${e.message || e}`;
    }
  })();
}
register("/topics", TopicsView);
