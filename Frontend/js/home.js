// FILE: Frontend/js/home.js
function HomeView(){
  $("#view").innerHTML = `
  <section class="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-cyan-500/10">
    <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl"></div>
    <div class="relative z-10 px-6 py-14 md:px-12 md:py-20">
      <div class="mx-auto max-w-4xl text-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/40 dark:bg-neutral-900/70 dark:text-blue-300">
          <i data-lucide="sparkles" class="h-4 w-4"></i> Ứng dụng AI trong phân tích & phản hồi feedback sinh viên
        </span>
        <h1 class="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">
          Nền tảng <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">phân tích, báo cáo</span> & <span class="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">phản hồi tự động</span>
        </h1>
        <p class="mx-auto mt-4 max-w-3xl text-lg text-neutral-600 dark:text-neutral-300">
          XIN CHÀO BẠN 
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a class="btn btn-primary gap-2" href="#/feedback"><i data-lucide="message-square-plus"></i> Gửi Phản Hồi</a>
          <a class="btn gap-2" href="#/method"><i data-lucide="workflow"></i> Quy trình AI</a>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-12 grid gap-8 md:grid-cols-2">
    
    <div class="card p-6">
      <h3 class="text-xl font-bold mb-4">Thông tin thu thập</h3>
      <div class="space-y-4">
        
        <div class="flex items-start gap-4">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
            <i data-lucide="message-square" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Nội dung & Hình ảnh</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Tiếp nhận phản hồi dạng văn bản kèm hình ảnh minh họa (nếu có).</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mt-1">
            <i data-lucide="tag" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Chủ đề tự động</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Hệ thống AI tự động phân loại và gán chủ đề cho mỗi phản hồi.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mt-1">
            <i data-lucide="database" class="w-5 h-5 text-purple-600 dark:text-purple-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Dữ liệu có cấu trúc</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Mọi thông tin được lưu trữ an toàn, có cấu trúc, sẵn sàng cho việc phân tích.</p>
          </div>
        </div>

      </div>
    </div>

    <div class="card p-6">
      <h3 class="text-xl font-bold mb-4">Các bước xử lý</h3>
      <div class="space-y-4">

        <div class="flex items-start gap-4">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mt-1">
            <i data-lucide="filter" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Tiền xử lý & Làm sạch</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Tự động lọc spam, chuẩn hóa chính tả và trích xuất từ khóa quan trọng.</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mt-1">
            <i data-lucide="brain-circuit" class="w-5 h-5 text-yellow-600 dark:text-yellow-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Phân tích bằng AI</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Phân tích cảm xúc, phát hiện chủ đề mới và tạo phản hồi gợi ý bằng Gemini.</p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mt-1">
            <i data-lucide="bell-ring" class="w-5 h-5 text-red-600 dark:text-red-400"></i>
          </div>
          <div>
            <h4 class="font-semibold">Báo cáo & Cảnh báo</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Hiển thị Dashboard trực quan và gửi cảnh báo sớm khi có vấn đề tiêu cực.</p>
          </div>
        </div>
        
      </div>
    </div>
  </section>
  `;
  // Khởi tạo lại các icon mới
  if (window.lucide) {
      lucide.createIcons();
  }
}
register("/", HomeView);