async function AdminView() {
  $("#view").innerHTML = `
  <div class="card">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-2xl font-bold">Quản trị</h2>
      <span class="text-xs text-neutral-500">Phản hồi thủ công hoặc dùng Gemini AI</span>
    </div>
    <div class="overflow-x-auto">
      <table class="table" id="admTable">
        <thead>
          <tr>
            <th>Thời gian</th><th>Người gửi</th><th>Chủ đề</th>
            <th>Cảm xúc</th><th>Nội dung</th><th>Trạng thái</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>`;

  try {
    const { token } = authAPI.getAuth();
    const res = await fetch(`${API_BASE}/feedbacks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const tbody = $("#admTable tbody");
    const mapS = s => s === "POS" ? "Tích cực" : s === "NEG" ? "Tiêu cực" : "Trung lập";

    tbody.innerHTML = data.map(f => {
      const topic = f.topic && !f.topic.startsWith("Lỗi") ? f.topic : f.cat;
      const status = f.auto_reply && !f.auto_reply.startsWith("Lỗi")
        ? `<span class="text-green-600 font-semibold">Đã phản hồi</span>`
        : `<span class="text-gray-400">Chưa phản hồi</span>`;
      return `
      <tr>
        <td>${f.ts}</td><td>${f.user}</td><td>${topic}</td>
        <td>${mapS(f.senti)}</td><td>${f.txt}</td><td>${status}</td>
        <td><button class="btn btn-primary text-xs" data-id="${f.id}" data-text="${f.txt.replace(/"/g, "&quot;")}">Phản hồi</button></td>
      </tr>`;
    }).join("");

    tbody.onclick = e => {
      const btn = e.target.closest("button[data-id]");
      if (btn) showReplyModal(btn.dataset.id, btn.dataset.text);
    };
  } catch (err) {
    showToast("Không tải được dữ liệu quản trị");
  }
}

function showReplyModal(fid, text) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
  <div class="modal-content">
    <h3 class="text-lg font-bold mb-2">Phản hồi cho Feedback</h3>
    <p class="text-sm bg-gray-100 p-2 rounded mb-3">${text}</p>
    <textarea id="replyText" class="input w-full mb-3" rows="4" placeholder="Nhập nội dung..."></textarea>
    <div class="flex justify-end gap-2">
      <button id="btnAI" class="btn">AI Gợi ý</button>
      <button id="btnSend" class="btn btn-primary">Gửi</button>
    </div>
  </div>`;
  document.body.appendChild(modal);

  $("#btnAI").onclick = async () => {
    const { token } = authAPI.getAuth();
    const btn = $("#btnAI");
    authAPI.setBtnLoading(btn, true, "AI đang viết...");
    try {
      const res = await fetch(`${API_BASE}/feedbacks/${fid}/regen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Lỗi AI");
      $("#replyText").value = data.auto_reply || "";
      showToast("✅ AI đã sinh phản hồi!");
    } catch (err) {
      showToast(err.message);
    } finally {
      authAPI.setBtnLoading(btn, false);
    }
  };

  $("#btnSend").onclick = async () => {
    const text = $("#replyText").value.trim();
    if (!text) return showToast("Vui lòng nhập nội dung.");
    const { token } = authAPI.getAuth();
    const res = await fetch(`${API_BASE}/feedbacks/${fid}/reply`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply_text: text }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("✅ Đã gửi phản hồi!");
      modal.remove();
      AdminView();
    } else showToast(data.detail || "Lỗi gửi phản hồi");
  };

  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

register("/admin", AdminView);
