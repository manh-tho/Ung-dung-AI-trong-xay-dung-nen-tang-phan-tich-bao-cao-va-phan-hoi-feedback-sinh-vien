// FILE: Frontend/js/feedback.js
(function guard() {
  const hash = String(window.location.hash || "");
  if (hash.startsWith("#/feedback")) {
    const { token } = authAPI.getAuth();
    if (!token) {
      alert("Vui lòng đăng nhập để gửi phản hồi.");
      location.href = "./auth/login.html";
    }
  }
})();

register("/feedback", function renderFeedback() {
  const view = document.getElementById("view");
  if (!view) return;

  view.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <div class="card p-8">
        <div class="flex items-center gap-4 mb-6">
            <div class="inline-block p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <i data-lucide="message-square-plus" class="w-7 h-7 text-blue-600 dark:text-blue-400"></i>
            </div>
            <div>
                <h1 class="text-2xl font-bold">Gửi Góp ý & Phản hồi</h1>
                <p class="text-neutral-500 dark:text-neutral-400">Ý kiến của bạn giúp chúng tôi cải thiện tốt hơn.</p>
            </div>
        </div>

        <div class="space-y-5">
          <div>
            <label class="text-sm font-medium mb-1 block">Nội dung phản hồi của bạn</label>
            <textarea id="fbText" class="input w-full" rows="5" placeholder="Nhập chi tiết góp ý, thắc mắc hoặc đề xuất của bạn ở đây..."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-sm font-medium mb-1 block">Chủ đề (Tự động)</label>
              <div class="relative">
                <i data-lucide="tag" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                <input class="input pl-10 bg-gray-100 dark:bg-gray-800" value="AI sẽ tự động phân loại" disabled />
              </div>
               <p class="text-xs text-gray-500 mt-1">Chúc bạn một ngày vui</p>
            </div>
            <div>
              <label class="text-sm font-medium mb-1 block">Ảnh minh họa (Tùy chọn)</label>
              <input id="fbImg" type="file" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
            </div>
          </div>

          <p id="fbErr" class="hidden text-sm text-red-600 text-center"></p>

          <div class="flex items-center justify-end pt-2">
            <button id="btnSend" class="btn btn-primary !py-3 !px-6 !text-base">
              <i data-lucide="send" class="w-5 h-5"></i>
              Gửi phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Kích hoạt lại icon và sự kiện
  if (window.lucide) window.lucide.createIcons();
  document.getElementById("btnSend")?.addEventListener("click", submitFeedback);
});

async function submitFeedback() {
  const err = $("#fbErr");
  const btn = $("#btnSend");
  const { token } = authAPI.getAuth();

  if (!token) {
    alert("Vui lòng đăng nhập để gửi phản hồi.");
    location.href = "./auth/login.html";
    return;
  }

  const textEl = $("#fbText");
  const imgEl  = $("#fbImg");
  const text = (textEl?.value || "").trim();
  const file = imgEl?.files?.[0];

  if (!text) {
    authAPI.showError(err, "Vui lòng nhập nội dung phản hồi.");
    return;
  }
  authAPI.showError(err, "");

  try {
    authAPI.setBtnLoading(btn, true, "Đang gửi...");

    let imgUrl = null;
    if (file) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/upload-image`, { 
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd 
        });
        if (!upRes.ok) throw new Error(`Upload ảnh thất bại`);
        const upData = await upRes.json();
        imgUrl = upData.url;
      } catch (e) {
        console.warn("Lỗi upload ảnh, sẽ gửi không kèm ảnh:", e);
        showToast("Không thể upload ảnh, phản hồi sẽ được gửi không kèm ảnh.");
      }
    }

    const res = await fetch(`${API_BASE}/feedbacks`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ text, img: imgUrl }) // Chỉ gửi text và img
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || `Gửi thất bại`);

    showToast("Đã gửi phản hồi thành công!");
    if (textEl) textEl.value = "";
    if (imgEl)  imgEl.value = "";
    
    // Chuyển hướng tới trang lịch sử sau khi gửi
    setTimeout(() => {
        window.location.hash = '/history';
    }, 1000);

  } catch (ex) {
    authAPI.showError(err, ex?.message || "Có lỗi xảy ra");
  } finally {
    authAPI.setBtnLoading(btn, false);
  }
}