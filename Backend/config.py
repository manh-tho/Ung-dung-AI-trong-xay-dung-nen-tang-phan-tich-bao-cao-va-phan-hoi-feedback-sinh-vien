# Backend/config.py  (FINAL - Driver {SQL Server}, không tham số lạ)
import urllib.parse

# AI (để placeholder cũng không sao)
GEMINI_API_KEY = "AIzaSyBxTbVtMx6KyhE6aoAwZdFI8ZKUBgSHIjg"
GEMINI_MODEL   = "gemini-1.5-flash-001"
HF_MODEL_ID    = "5CD-AI/Vietnamese-Sentiment-visobert"

# ===== CHỌN 1 DÒNG SERVER ĐÚNG VỚI SSMS CỦA BẠN =====
# Theo ảnh SSMS trước đó: Server name = LAPTOP-G2Q12JTR (default instance)
SERVER_NAME = "LAPTOP-G2Q12JTR"
# Nếu không được, thử lần lượt:
# SERVER_NAME = "localhost"
# SERVER_NAME = "127.0.0.1"
# SERVER_NAME = "(local)"
# Nếu SSMS của bạn thực tế là instance đặt tên (ví dụ SQLEXPRESS):
# SERVER_NAME = r"LAPTOP-G2Q12JTR\SQLEXPRESS"   # lưu ý có dấu \\ trong Python string

# --- SQL Server (local, Windows Authentication) ---
SERVER_NAME = r"LAPTOP-G2Q12JTR"      # <== đúng theo SSMS của bạn
DB_NAME     = "FeedbackDB"

# Chuỗi pyodbc để test thuần (nếu cần)
ODBC_STR = (
    "Driver={SQL Server};"
    f"Server={SERVER_NAME};"
    f"Database={DB_NAME};"
    "Trusted_Connection=Yes;"
)

# Chuỗi cho SQLAlchemy + pyodbc
# Lưu ý: dùng “driver=SQL+Server” và “trusted_connection=yes”
DB_URL = (
    f"mssql+pyodbc://@{SERVER_NAME}/{DB_NAME}"
    "?driver=SQL+Server&trusted_connection=yes"
)


# JWT / Upload / Admin
UPLOAD_DIR = "uploads"
JWT_SECRET = "change-this-please"
JWT_ALG = "HS256"
JWT_EXPIRE_MINUTES = 60 * 8

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "Admin@123"
DEFAULT_ADMIN_FULLNAME = "Quản trị viên"
