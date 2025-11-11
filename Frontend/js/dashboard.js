// FILE: Frontend/js/dashboard.js
let dashboardIntervalId = null;

// 🧭 Hàm parse thời gian chuẩn định dạng Việt Nam (dd/mm/YYYY HH:MM:SS)
function parseVNTime(s) {
  if (!s) return null;
  const [d, m, rest] = s.split("/");
  if (!rest) return null;
  const [y, time] = rest.split(" ");
  const [hh = "0", mm = "0", ss = "0"] = (time || "").split(":");
  const dt = new Date(
    Number(y), Number(m) - 1, Number(d),
    Number(hh), Number(mm), Number(ss)
  );
  return isNaN(dt.getTime()) ? null : dt;
}

function DashboardView() {
  const { user } = window.authAPI.getAuth();
  if (!user || user.role !== 'admin') {
    const view = document.getElementById('view');
    if (view) {
      view.innerHTML = `
        <div class="card text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
          <p>Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.</p>
          <a href="#/feedback" class="btn btn-primary mt-4">Về trang Gửi Feedback</a>
        </div>`;
    }
    return;
  }

  $("#view").innerHTML = `
    <div class="grid xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 space-y-6">
        <div class="card">
          <h2 class="text-2xl font-bold mb-2">Dashboard</h2>
          <p class="text-sm text-neutral-500">
            Theo dõi số lượng theo thời gian, tỷ lệ cảm xúc và top vấn đề. 
            Dữ liệu tự động cập nhật sau mỗi 30 giây.
          </p>
        </div>

        <div class="card">
          <h3 class="font-semibold mb-2">Số lượng theo ngày</h3>
          <canvas id="chart0"></canvas>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="card">
            <h3 class="font-semibold mb-2">Tỷ lệ cảm xúc</h3>
            <canvas id="chart1"></canvas>
          </div>
          <div class="card">
            <h3 class="font-semibold mb-2">Số lượng theo chủ đề</h3>
            <canvas id="chart2"></canvas>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card">
          <h3 class="font-semibold mb-2">Cảnh báo sớm (7 ngày)</h3>
          <div id="alertBox" class="space-y-2 text-sm"></div>
        </div>
        <div class="card">
          <h3 class="font-semibold mb-2">Top vấn đề theo tuần (7 ngày)</h3>
          <ul id="topList" class="list-disc pl-5 text-sm"></ul>
        </div>
      </div>
    </div>`;

  loadDashboardData();
  dashboardIntervalId = setInterval(loadDashboardData, 30000);
}

function cleanupDashboard() {
  if (dashboardIntervalId) {
    clearInterval(dashboardIntervalId);
    dashboardIntervalId = null;
    console.log("Dashboard auto-refresh stopped.");
  }
}

async function loadDashboardData() {
  console.log("Loading dashboard data...");
  try {
    const [sres, fres] = await Promise.all([
      fetch(`${API_BASE}/stats/overview`),
      fetch(`${API_BASE}/feedbacks?limit=300`)
    ]);

    if (!sres.ok || !fres.ok) throw new Error("Failed to fetch dashboard data");

    const stats = await sres.json();
    const data = await fres.json();

    // Hủy chart cũ
    if (window.dashboardCharts) {
      window.dashboardCharts.forEach(chart => chart.destroy());
    }
    window.dashboardCharts = [];

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#e5e7eb' : '#111827';

    // --- Chart 0: line theo ngày ---
    const c0 = new Chart($("#chart0"), {
      type: "line",
      data: {
        labels: (stats.last7 || []).map(d => d.date),
        datasets: [{
          data: (stats.last7 || []).map(d => d.count),
          tension: 0.35,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)'
        }]
      },
      options: {
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }
        },
        plugins: { legend: { display: false } }
      }
    });

    // --- Chart 1: doughnut cảm xúc ---
    const senti = stats.by_senti || { POS: 0, NEU: 0, NEG: 0 };
    const c1 = new Chart($("#chart1"), {
      type: "doughnut",
      data: {
        labels: ["Tích cực", "Trung lập", "Tiêu cực"],
        datasets: [{
          data: [senti.POS, senti.NEU, senti.NEG],
          backgroundColor: ["#22c55e", "#eab308", "#ef4444"]
        }]
      },
      options: { plugins: { legend: { labels: { color: textColor } } } }
    });

    // --- Chart 2: bar theo chủ đề ---
    const cats = stats.by_cat || {};
    const c2 = new Chart($("#chart2"), {
      type: "bar",
      data: {
        labels: Object.keys(cats),
        datasets: [{ data: Object.values(cats), backgroundColor: "#3b82f6" }]
      },
      options: {
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
        },
        plugins: { legend: { display: false } }
      }
    });

    window.dashboardCharts.push(c0, c1, c2);

    // --- Cảnh báo ---
    $("#alertBox").innerHTML = stats.alert
      ? `<div class="p-3 rounded-lg border border-red-300/50 bg-red-500/10 text-red-700 dark:border-red-800/40 dark:text-red-300">
           ⚠️ Cảnh báo: Tỷ lệ phản hồi tiêu cực tăng cao trong 7 ngày qua.
         </div>`
      : '<div class="text-neutral-500">Không có cảnh báo.</div>';

    // --- Top vấn đề theo tuần ---
    const now = Date.now();
    const last7 = data.filter(f => {
      const dt = parseVNTime(f.ts) || new Date(f.ts);
      const t = dt.getTime();
      return !isNaN(t) && (now - t) <= 7 * 24 * 3600 * 1000;
    });

    const totalByCat7 = {};
    last7.forEach(f => {
      totalByCat7[f.cat] = (totalByCat7[f.cat] || 0) + 1;
    });

    const top = Object.entries(totalByCat7)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    $("#topList").innerHTML = top.length
      ? top.map(([k, v]) => `<li>${k}: <b>${v}</b> phản hồi</li>`).join('')
      : '<li class="text-neutral-500">Chưa có dữ liệu</li>';
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

register("/dashboard", {
  render: DashboardView,
  cleanup: cleanupDashboard
});
