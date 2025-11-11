// FILE: Frontend/js/method.js
function MethodView() {
    const view = document.getElementById("view");
    if (!view) return;

    view.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 md:mb-16">
        <span class="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300">
            <i data-lucide="workflow" class="w-4 h-4"></i> Quy trình Xử lý
        </span>
        <h1 class="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Từ Dữ liệu thô đến <span class="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Hành động Thông minh</span>
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hệ thống AI hoạt động qua bốn giai đoạn chính để biến những phản hồi rời rạc thành các báo cáo có giá trị và đề xuất hữu ích.
        </p>
      </div>

      <div class="relative">
        <div class="absolute left-9 md:left-1/2 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>

        <div class="space-y-12">
          
          <div class="relative flex items-start md:items-center">
            <div class="flex items-center justify-center w-18 h-18 rounded-full bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-gray-700 absolute left-0 md:left-1/2 md:-translate-x-1/2">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <i data-lucide="database" class="w-7 h-7 text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
            <div class="w-full md:w-[calc(50%-2.25rem)] pl-24 md:pl-0 md:pr-12">
              <div class="card p-6">
                <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">Bước 1</p>
                <h3 class="text-xl font-bold mt-1">Thu thập Dữ liệu</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Tiếp nhận phản hồi của sinh viên qua form, bao gồm nội dung văn bản và hình ảnh đính kèm (nếu có).</p>
              </div>
            </div>
          </div>

          <div class="relative flex items-start md:items-center">
             <div class="flex items-center justify-center w-18 h-18 rounded-full bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-gray-700 absolute left-0 md:left-1/2 md:-translate-x-1/2">
              <div class="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                <i data-lucide="filter" class="w-7 h-7 text-indigo-600 dark:text-indigo-400"></i>
              </div>
            </div>
            <div class="w-full md:w-[calc(50%-2.25rem)] md:ml-[calc(50%+2.25rem)] pl-24 md:pl-12">
              <div class="card p-6">
                <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Bước 2</p>
                <h3 class="text-xl font-bold mt-1">Tiền xử lý & Làm sạch</h3>
                <ul class="list-disc pl-5 text-sm space-y-1 mt-2 text-gray-600 dark:text-gray-400">
                  <li>Loại bỏ stopword, chuẩn hóa chính tả.</li>
                  <li>Tách từ và trích xuất các từ khóa quan trọng.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="relative flex items-start md:items-center">
            <div class="flex items-center justify-center w-18 h-18 rounded-full bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-gray-700 absolute left-0 md:left-1/2 md:-translate-x-1/2">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                <i data-lucide="brain-circuit" class="w-7 h-7 text-purple-600 dark:text-purple-400"></i>
              </div>
            </div>
            <div class="w-full md:w-[calc(50%-2.25rem)] pl-24 md:pl-0 md:pr-12">
              <div class="card p-6">
                <p class="text-sm font-semibold text-purple-600 dark:text-purple-400">Bước 3</p>
                <h3 class="text-xl font-bold mt-1">Phân tích bằng AI</h3>
                 <ul class="list-disc pl-5 text-sm space-y-1 mt-2 text-gray-600 dark:text-gray-400">
                  <li><b>Phân loại chủ đề:</b> Gán nhãn Học tập, CSVC...</li>
                  <li><b>Phân tích cảm xúc:</b> Xác định Tích cực/Tiêu cực.</li>
                  <li><b>Gợi ý phản hồi:</b> Dùng Gemini để tạo câu trả lời.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="relative flex items-start md:items-center">
            <div class="flex items-center justify-center w-18 h-18 rounded-full bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-gray-700 absolute left-0 md:left-1/2 md:-translate-x-1/2">
              <div class="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <i data-lucide="bar-chart-3" class="w-7 h-7 text-green-600 dark:text-green-400"></i>
              </div>
            </div>
            <div class="w-full md:w-[calc(50%-2.25rem)] md:ml-[calc(50%+2.25rem)] pl-24 md:pl-12">
              <div class="card p-6">
                <p class="text-sm font-semibold text-green-600 dark:text-green-400">Bước 4</p>
                <h3 class="text-xl font-bold mt-1">Báo cáo & Phản hồi</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Kết quả được tổng hợp trên Dashboard. Quản trị viên xem và gửi phản hồi lại cho sinh viên.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;

    // Khởi tạo lại các icon mới
    if (window.lucide) {
        lucide.createIcons();
    }
}
register("/method", MethodView);