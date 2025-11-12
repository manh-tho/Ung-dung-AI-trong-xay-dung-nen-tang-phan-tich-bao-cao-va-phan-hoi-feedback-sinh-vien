<div align="center">
<div align="center">
  <img src="logoDaiNam.png" width="200"/> 
</div>

# 🎓 AI Feedback Platform

### *Ứng Dụng AI Trong Xây Dựng Nền Tảng Phân Tích, Báo Cáo Và Phản Hồi Feedback Sinh Viên*

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Transformers](https://img.shields.io/badge/HF_Transformers-FED141?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/docs/transformers/index)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png" alt="Laptop" width="140"/>

**Hệ thống dùng AI để phân tích cảm xúc & chủ đề phản hồi sinh viên, trực quan hóa dữ liệu và sinh phản hồi tự động.**

[🚀 Demo nhanh](#-sử-dụng) • [✨ Tính Năng](#-tính-năng) • [📦 Cài Đặt](#-cài-đặt) • [📖 API](#-api-documentation) • [🧠 Models](#-ai-models) • [🤝 Đóng Góp](#-đóng-góp)

---

</div>

## 📋 Mục Lục
- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [AI Models](#-ai-models)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Sử Dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Tài Liệu](#-tài-liệu)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Đóng Góp](#-đóng-góp)
- [License](#-license)
- [Tác Giả](#-tác-giả)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Giới Thiệu
**AI Feedback Platform** kết hợp **NLP** và **LLM** để tự động hóa quy trình:
- Thu nhận & quản lý phản hồi sinh viên  
- **Phân tích cảm xúc** (tích cực/trung lập/tiêu cực)  
- **Phân loại chủ đề** (Học tập, CSVC, Học phí, Sự kiện, Khác)  
- **Sinh phản hồi tự động** bằng **Google Gemini**  
- **Dashboard** trực quan hoá dữ liệu phục vụ quản trị  

> Mục tiêu: Nâng cao chất lượng giảng dạy và trải nghiệm sinh viên trong môi trường giáo dục số.

---

## ✨ Tính Năng

### 💬 1) Quản Lý & Gửi Phản Hồi
- Form sinh viên gửi phản hồi (Frontend HTML + Tailwind/JS)
- Lưu trữ an toàn trong **SQLite**
- Bộ lọc, tìm kiếm theo **chủ đề**/**cảm xúc**/**thời gian**

### 🧠 2) Phân Tích Cảm Xúc (Sentiment)
- Fine-tune từ **VisoBERT** tiếng Việt
- Gán nhãn: 😄 Tích cực • 😐 Trung lập • 😡 Tiêu cực

### 🧩 3) Phân Loại Chủ Đề (Category)
- Nhãn: **Học tập, CSVC, Học phí, Sự kiện, Khác**

### 🤖 4) Phản Hồi Tự Động (AI Auto-Reply)
- Tích hợp **Google Gemini** tạo phản hồi phù hợp ngữ cảnh

### 📊 5) Dashboard Analytics
- Biểu đồ cảm xúc, tỷ lệ chủ đề, xu hướng theo thời gian (Chart.js)

### 🔐 6) Xác Thực & Phân Quyền
- Đăng ký/Đăng nhập với **JWT**
- Quyền **Sinh viên** / **Quản trị viên**

---

## 🛠️ Công Nghệ

### Backend Stack
| Công Nghệ | Phiên Bản | Mục Đích |
|---|---|---|
| Python | 3.12+ | Ngôn ngữ |
| FastAPI | latest | Web framework (async) |
| Uvicorn | latest | ASGI server |
| SQLAlchemy | 2.x | ORM |
| Pydantic | v2 | Data validation |
| Google Generative AI | latest | LLM (auto-reply) |

### Frontend Stack
| Công Nghệ | Mục Đích |
|---|---|
| HTML + TailwindCSS | Giao diện |
| JavaScript (ES6) | Logic |
| Chart.js 4.x | Biểu đồ |

---

## 🧠 AI Models

- **Sentiment Model**: `my_custom_sentiment_model`  
  Base: `5CD-AI/Vietnamese-Sentiment-visobert`  
  Accuracy: ~92% 

- **Category Model**: `my_custom_category_model`  
  Nhãn: **Học tập, CSVC, Học phí, Sự kiện, Khác**  
  Accuracy: ~90% 

**Cấu hình ví dụ (train sentiment):**
```python
BASE_MODEL = "5CD-AI/Vietnamese-Sentiment-visobert"
DATA_FILE = "training_data.csv"
OUTPUT_DIR = "./my_custom_sentiment_model"
```

**Huấn luyện model:**
```bash
cd Backend
python train_sentiment_model.py
python train_category_model.py
```

---

## 🏗️ Kiến Trúc Hệ Thống
```text
┌─────────────────────────────────────────────────────────────┐
│                          FRONTEND                           │
│  index.html  feedback.html  dashboard.html  admin.html      │
│  TailwindCSS + Chart.js + Vanilla JS                        │
│                │            Fetch API (HTTP)                │
└─────────────────┼───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                        FASTAPI BACKEND                      │
│  main.py → REST API:                                        │
│   • POST /auth/login, /auth/register  (JWT)                 │
│   • GET/POST /feedback                                      │
│   • POST /predict          (sentiment + category)           │
│   • POST /auto-reply       (Gemini)                         │
│   • GET  /dashboard        (analytics data)                 │
│                                                              │
│      ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│      │  Models      │  │  Gemini       │  │   Database   │  │
│      │ (Transformers│  │  Auto-Reply   │  │   SQLite     │  │
│      └──────────────┘  └───────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống
- Python 3.12+
- RAM 4GB (khuyến nghị 8GB)
- Dung lượng trống ~2GB

### Bước 1: Clone Repository
```bash
git clone https://github.com/manh-tho/Ung-dung-AI-trong-xay-dung-nen-tang-phan-tich-bao-cao-va-phan-hoi-feedback-sinh-vien.git
cd Ung-dung-AI-trong-xay-dung-nen-tang-phan-tich-bao-cao-va-phan-hoi-feedback-sinh-vien
```

### Bước 2: Tạo Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### Bước 3: Cài Dependencies
```bash
pip install -r requirements.txt
```

### Bước 4: Thiết Lập API Key (Gemini)
Tạo file `.env` trong thư mục **Backend/**:
```bash
GEMINI_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Bước 5: Chạy Server
```bash
cd Backend
uvicorn main:app --reload --port 8000
```

### Bước 6: Mở Giao Diện
- **API Docs**: http://127.0.0.1:8000/docs  
- **Web UI**: mở `Frontend/index.html` (khuyến nghị dùng **VS Code → Live Server**)

---

## 🚀 Sử Dụng

### 1) Sinh viên gửi phản hồi
```text
1. Mở Frontend/index.html → trang Gửi phản hồi
2. Điền nội dung, chủ đề (optional)
3. Gửi → backend lưu vào SQLite & trả kết quả AI (nếu bật tự động)
```

### 2) Phân tích AI (Admin)
```text
1. Đăng nhập (JWT) → vào Dashboard
2. Xem thống kê: cảm xúc, chủ đề, xu hướng
3. Lọc theo thời gian/chủ đề → xuất dữ liệu khi cần
```

### 3) Sinh phản hồi tự động (Gemini)
```text
Sau khi gửi tự động AI Gemini phản hồi tự động hoặc:
1. Tại trang quản trị, chọn một phản hồi
2. Nhấn “Tạo phản hồi AI” → Gemini sinh nội dung
3. Duyệt & gửi lại cho sinh viên (tuỳ workflow)
```

---

## 📖 API Documentation
Truy cập **http://127.0.0.1:8000/docs** để xem & thử API.

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /auth/register | Đăng ký tài khoản |
| POST | /auth/login | Đăng nhập, trả JWT |
| GET | /feedback | Lấy danh sách phản hồi |
| POST | /feedback | Tạo phản hồi |
| POST | /predict | Phân tích cảm xúc & chủ đề |
| POST | /auto-reply | Sinh phản hồi bằng Gemini |
| GET | /dashboard | Trả dữ liệu thống kê |

---

## 📚 Tài Liệu
- `/Backend/train_sentiment_model.py` — Script huấn luyện sentiment  
- `/Backend/train_category_model.py` — Script huấn luyện category  
- `/Backend/config.py` — Cấu hình model & Gemini  
- `/Frontend/` — HTML/CSS/JS (Tailwind, Chart.js)

---


## 🎓 Roadmap
- [ ] Trang quản trị nâng cao (bộ lọc, export CSV)  
- [ ] Bộ rule kiểm duyệt ngôn từ nhạy cảm  
- [ ] Multi-tenant theo lớp/khoa  
- [ ] Triển khai Cloud (Railway/Render/Azure)  
- [ ] CICD + tests (pytest & Playwright)  
- [ ] Internationalization (EN/VI)

---

## 🤝 Đóng Góp
```text
1) Fork repo
2) Tạo branch: git checkout -b feature/amazing-feature
3) Commit: git commit -m "feat: add amazing feature"
4) Push: git push origin feature/amazing-feature
5) Mở Pull Request
```

---

## 📄 License
Phát hành theo **MIT License**. Xem tệp `LICENSE`.

---

## 👨‍💻 Tác Giả
**Hồ Đức Mạnh** 
📧 manh1052004@gmail.com  

---

## 🙏 Acknowledgments
- [HuggingFace Transformers](https://huggingface.co/)  
- [Google Gemini](https://ai.google.dev/)  
- [FastAPI](https://fastapi.tiangolo.com/)  
- [Chart.js](https://www.chartjs.org/)

---

<div align="center">

**⭐ Nếu project này hữu ích, hãy cho một star để ủng hộ mình nhé! ⭐**  
Made with ❤️ by [ Hồ Đức Mạnh ]

</div>




