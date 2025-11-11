// FILE: Frontend/js/notifications.js
async function NotificationsView() {
    const view = document.getElementById('view');
    view.innerHTML = `
    <div class="card">
      <div class="flex items-center gap-3 mb-4">
        <i data-lucide="bell" class="w-6 h-6 text-blue-600"></i>
        <h2 class="text-2xl font-bold">Thông báo Phản hồi</h2>
      </div>
      <div id="notification-list" class="space-y-4">
        <p class="text-neutral-500">Đang tải thông báo...</p>
      </div>
    </div>`;

    if (window.lucide) window.lucide.createIcons();

    try {
        const { token } = authAPI.getAuth();
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`${API_BASE}/notifications/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Không thể tải thông báo");
        const notifications = await res.json();
        
        const listEl = document.getElementById('notification-list');
        if (notifications.length === 0) {
            listEl.innerHTML = '<p class="text-neutral-500">Bạn chưa có thông báo mới nào.</p>';
            return;
        }

        listEl.innerHTML = notifications.map(item => `
            <div class="p-4 border rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-800 transition hover:shadow-sm">
                <p class="text-sm text-neutral-500 mb-2">
                    Quản trị viên đã phản hồi về góp ý của bạn lúc <span class="font-medium">${item.ts || ''}</span>: 
                    <span class="font-medium text-neutral-800 dark:text-neutral-200 block mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">"${item.txt}"</span>
                </p>
                <div class="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
                    <p class="text-blue-800 dark:text-blue-200">${item.auto_reply}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        showToast("Không tải được thông báo");
        document.getElementById('notification-list').innerHTML = '<p class="text-red-500">Đã xảy ra lỗi khi tải thông báo.</p>';
    }
}

register("/notifications", NotificationsView);