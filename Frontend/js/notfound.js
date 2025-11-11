function NotFoundView() {
$("#view").innerHTML = `
<div class="text-center p-10">
<h1 class="text-4xl font-bold mb-4">404 - Không tìm thấy trang</h1>
<a href="#/" class="btn btn-primary">Về trang chủ</a>
</div>`;
}
register("/404", NotFoundView);