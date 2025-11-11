# FILE: Backend/main.py
# -*- coding: utf-8 -*-
import os, re, uuid, json, time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Tuple
from zoneinfo import ZoneInfo  # ✅ chuẩn múi giờ hệ thống

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, func, Float, not_
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.hash import pbkdf2_sha256 as pwd_hasher
from jose import JWTError, jwt

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import google.generativeai as genai
from dotenv import load_dotenv

# Ẩn cảnh báo gRPC ALTS (tuỳ chọn)
os.environ["GRPC_VERBOSITY"] = "ERROR"
os.environ["GRPC_LOG_SEVERITY_LEVEL"] = "ERROR"

# =============== ENV / CONFIG ===============
load_dotenv()
GEMINI_API_KEY    = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_MODEL_NAME = (os.getenv("GEMINI_MODEL") or "models/gemini-2.5-flash-preview-05-20").strip()
CORS_ORIGINS      = [o.strip() for o in (os.getenv("CORS_ORIGINS") or "*").split(",") if o.strip()]

SENTIMENT_MODEL_DIR = "./my_custom_sentiment_model"
CATEGORY_MODEL_DIR  = "./my_custom_category_model"

JWT_SECRET, JWT_ALG, JWT_EXPIRE_MINUTES = "a_very_secret_key", "HS256", 60 * 8
DATABASE_URL = "sqlite:///./feedback.db"

ALT_STABLE_MODEL = "models/gemini-2.0-flash"  # fallback model ổn định

# 🔁 Múi giờ & thời gian chuẩn
LOCAL_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
UTC_TZ = timezone.utc
def now_utc() -> datetime:
    return datetime.now(UTC_TZ)

def to_local(dt: Optional[datetime]) -> Optional[datetime]:
    if not dt: return None
    # Đảm bảo aware, chuyển UTC -> VN
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC_TZ)
    return dt.astimezone(LOCAL_TZ)

def fmt_time(dt: Optional[datetime]) -> Dict[str, Optional[str]]:
    """
    Trả về đủ 3 dạng:
    - ts  (dd/MM/YYYY HH:mm:ss) — để hiển thị
    - ts_iso  (ISO 8601)        — để client parse chuẩn
    - ts_epoch (s)              — để sort/so sánh
    """
    if not dt:
        return {"ts": None, "ts_iso": None, "ts_epoch": None}
    loc = to_local(dt)
    return {
        "ts": loc.strftime("%d/%m/%Y %H:%M:%S"),
        "ts_iso": loc.isoformat(),
        "ts_epoch": int(loc.timestamp()),
    }

# =============== DB ===============
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(200))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="student")
    created_at = Column(DateTime, default=now_utc)  # ✅ lưu UTC aware

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True)
    user = Column(String(120), nullable=False)
    txt = Column(Text, nullable=False)
    cat = Column(String(120))
    senti = Column(String(10))
    score = Column(Float, default=0.0)
    img = Column(String(500))
    ts = Column(DateTime, default=now_utc)  # ✅ lưu UTC aware
    auto_reply = Column(Text)
    topic = Column(String(200))

# =============== Schemas ===============
class RegisterIn(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = ""

class LoginIn(BaseModel):
    username: str
    password: str
    role: str = "student"

class LoginOut(BaseModel):
    token: str
    user: dict

class FeedbackIn(BaseModel):
    text: str
    img: Optional[str] = None

class ManualReplyIn(BaseModel):
    reply_text: str

# =============== APP / CORS / STATIC ===============
app = FastAPI(title="AI Student Feedback")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# =============== AUTH HELPERS ===============
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": now_utc() + timedelta(minutes=JWT_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)

def hash_password(raw: str) -> str: return pwd_hasher.hash(raw)
def verify_password(raw: str, h: str) -> bool:
    try: return pwd_hasher.verify(raw, h)
    except Exception: return False

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(401, "Token không hợp lệ")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        username = payload.get("sub")
        if not username: raise credentials_exception
    except JWTError:
        raise credentials_exception
    u = db.query(User).filter(User.username == username).first()
    if not u: raise HTTPException(401, "Không tìm thấy người dùng")
    return u

# =============== LOAD LOCAL MODELS ===============
senti_tokenizer, senti_model, senti_code_labels = None, None, ["NEG", "NEU", "POS"]
cat_tokenizer, cat_model, id_to_category = None, None, {}

try:
    print(">>> Loading Custom Sentiment Analysis model...")
    senti_tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_DIR)
    senti_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_DIR)
    print("✅ Sentiment model loaded.")
except Exception as e:
    print(f"*** WARNING: Could not load custom sentiment model. {e}")

try:
    print(">>> Loading Custom Category Classification model...")
    cat_tokenizer = AutoTokenizer.from_pretrained(CATEGORY_MODEL_DIR)
    cat_model = AutoModelForSequenceClassification.from_pretrained(CATEGORY_MODEL_DIR)
    with open(os.path.join(CATEGORY_MODEL_DIR, "label_map.json"), "r", encoding="utf-8") as f:
        id_to_category = json.load(f)["id_to_category"]
    print("✅ Category model loaded.")
except Exception as e:
    print(f"*** WARNING: Could not load custom category model. {e}")

# =============== GEMINI INIT ===============
def _normalize(name: str) -> str:
    if not name: return ""
    return name.strip()  # giữ nguyên 'models/...'

try:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is empty. Set it in .env")
    genai.configure(api_key=GEMINI_API_KEY)
    primary_model_name = _normalize(GEMINI_MODEL_NAME) or ALT_STABLE_MODEL
    gemini_primary = genai.GenerativeModel(primary_model_name)
    gemini_alt = genai.GenerativeModel(ALT_STABLE_MODEL)
    print(f"✅ Gemini configured. Primary: {primary_model_name} | Alt: {ALT_STABLE_MODEL}")
except Exception as e:
    gemini_primary = None
    gemini_alt = None
    print(f"*** WARNING: Could not configure Gemini. {e}")

# =============== AI HELPERS ===============
def analyze_sentiment(text: str) -> str:
    if not senti_model or not senti_tokenizer:
        return "NEU"
    try:
        inputs = senti_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256)
        with torch.no_grad():
            outputs = senti_model(**inputs)
        predicted_class_id = torch.argmax(outputs.logits, dim=1).item()
        return senti_code_labels[predicted_class_id]
    except Exception:
        return "NEU"

def classify_category(text: str) -> str:
    if not cat_model or not cat_tokenizer:
        return "Khác"
    try:
        inputs = cat_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256)
        with torch.no_grad():
            outputs = cat_model(**inputs)
        predicted_class_id = str(torch.argmax(outputs.logits, dim=1).item())
        return id_to_category.get(predicted_class_id, "Khác")
    except Exception:
        return "Khác"

def _extract_text(resp) -> str:
    if not resp:
        return ""
    t = getattr(resp, "text", None)
    if isinstance(t, str) and t.strip():
        return t.strip()
    try:
        cands = getattr(resp, "candidates", []) or []
        for c in cands:
            parts = getattr(getattr(c, "content", None), "parts", []) or []
            chunks = []
            for p in parts:
                txt = getattr(p, "text", None)
                if isinstance(txt, str):
                    chunks.append(txt)
            if chunks:
                return "\n".join(chunks).strip()
    except Exception:
        pass
    return ""

def _try_structured(model, prompt: str) -> Tuple[Optional[dict], Optional[str]]:
    try:
        generation_config = {
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {"topic": {"type": "string"}, "auto_reply": {"type": "string"}},
                "required": ["topic", "auto_reply"],
                "additionalProperties": False,
            },
        }
        r = model.generate_content(prompt, generation_config=generation_config)
        txt = _extract_text(r)
        if not txt:
            return None, "empty_text_structured"
        data = json.loads(txt)
        if not isinstance(data, dict) or "topic" not in data or "auto_reply" not in data:
            return None, "bad_json_structured"
        return data, None
    except Exception as e:
        return None, f"structured_error:{e}"

def _try_simple(model, prompt_core: str) -> Tuple[Optional[dict], Optional[str]]:
    try:
        prompt = (
            prompt_core
            + "\nHãy trả đúng 2 dòng, không thêm gì khác.\n"
              "Topic: <2-4 từ tiếng Việt>\n"
              "Reply: <câu trả lời ≤ 80 từ, lịch sự, chuyên nghiệp>"
        )
        r = model.generate_content(prompt)
        txt = _extract_text(r)
        if not txt:
            return None, "empty_text_simple"
        topic_match = re.search(r"(?i)^Topic:\s*(.+)$", txt, re.M)
        reply_match = re.search(r"(?i)^Reply:\s*(.+)$", txt, re.M | re.S)
        if not topic_match or not reply_match:
            return None, f"bad_format_simple:{txt[:120]}"
        topic = topic_match.group(1).strip()
        reply = reply_match.group(1).strip()
        return {"topic": topic, "auto_reply": reply}, None
    except Exception as e:
        return None, f"simple_error:{e}"

def _fallback_reply(text: str, senti: str, cat_hint: str = "", reason: str = "") -> Dict[str, str]:
    cat = cat_hint or classify_category(text)
    senti_vn = {"POS": "tích cực", "NEG": "tiêu cực", "NEU": "trung lập"}.get(senti, "trung lập")
    reply = (
        f"Cảm ơn bạn đã gửi phản hồi liên quan đến **{cat.lower()}**. "
        f"Chúng tôi đã tiếp nhận và đánh giá ý kiến của bạn là *{senti_vn}*. "
        "Bộ phận phụ trách sẽ xem xét chi tiết và phản hồi sớm nhất có thể. "
        "Rất mong bạn tiếp tục chia sẻ để giúp cải thiện chất lượng đào tạo và dịch vụ."
    )
    out = {"topic": cat, "auto_reply": reply, "ai_source": f"fallback:{reason or 'unknown'}"}
    print(">>> [AI] Fallback ->", out["ai_source"])
    return out

def generate_ai_response(text: str, senti: str) -> Dict[str, str]:
    """
    Chuỗi thử 3 nấc để đảm bảo dùng được AI thật:
    1) Structured JSON với model chính
    2) Định dạng đơn giản với model chính
    3) Định dạng đơn giản với model ổn định (ALT_STABLE_MODEL)
    Nếu vẫn lỗi (quota/khác) -> fallback.
    """
    senti_map = {"POS": "tích cực", "NEG": "tiêu cực", "NEU": "trung lập"}
    senti_text = senti_map.get(senti, "không xác định")

    prompt_core = (
        f'Một sinh viên đã gửi phản hồi: "{text}". '
        f"Cảm xúc: {senti_text}."
        "\nYêu cầu: đặt topic (2–4 từ), soạn reply ≤ 80 từ, lịch sự/chuyên nghiệp."
    )

    # 1) Structured JSON
    if gemini_primary:
        data, err = _try_structured(gemini_primary, prompt_core + "\nChỉ trả về JSON theo schema.")
        if data:
            data["ai_source"] = "gemini:structured"
            print(">>> [AI] Gemini structured OK")
            return data
        print(">>> [AI] Structured failed:", err)

        # 2) Simple
        data, err = _try_simple(gemini_primary, prompt_core)
        if data:
            data["ai_source"] = "gemini:simple"
            print(">>> [AI] Gemini simple OK")
            return data
        print(">>> [AI] Simple (primary) failed:", err)

    # 3) Simple trên model ổn định
    if gemini_alt:
        data, err = _try_simple(gemini_alt, prompt_core)
        if data:
            data["ai_source"] = "gemini:alt_model"
            print(">>> [AI] Gemini alt_model simple OK")
            return data
        print(">>> [AI] Simple (alt) failed:", err)

    # 4) Fallback
    return _fallback_reply(text, senti, reason="all_attempts_failed")

# =============== STARTUP ===============
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if not db.query(User).filter_by(username="admin").first():
            db.add(User(username="admin", full_name="Quản trị viên", role="admin",
                        password_hash=hash_password("Admin@123")))
            db.commit()
    print("✅ DB ready. Admin synced.")

# =============== AUTH APIs ===============
@app.post("/auth/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    uname = (payload.username or "").strip().lower()
    pwd = (payload.password or "").strip()
    if not re.match(r"^[a-z0-9_.-]{3,100}$", uname):
        raise HTTPException(400, "Username không hợp lệ")
    if len(pwd) < 4:
        raise HTTPException(400, "Mật khẩu quá ngắn")
    if db.query(User).filter(User.username == uname).first():
        raise HTTPException(400, "Tên tài khoản đã tồn tại")
    u = User(username=uname, full_name=(payload.full_name or "").strip(),
             role="student", password_hash=hash_password(pwd))
    db.add(u); db.commit()
    return {"ok": True, "message": "Đăng ký thành công"}

@app.post("/auth/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.username == payload.username.strip().lower()).first()
    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(401, "Sai tài khoản hoặc mật khẩu")
    if payload.role != u.role:
        raise HTTPException(401, "Sai vai trò")
    token = create_access_token({"sub": u.username})
    return {"token": token, "user": {"username": u.username, "full_name": u.full_name, "role": u.role}}

# =============== FEEDBACK APIs ===============
def _fmt_fb(fb: Feedback) -> dict:
    t = fmt_time(fb.ts)
    return {
        "id": fb.id, "user": fb.user, "txt": fb.txt, "cat": fb.cat, "senti": fb.senti,
        "img": fb.img, "ts": t["ts"], "ts_iso": t["ts_iso"], "ts_epoch": t["ts_epoch"],
        "auto_reply": fb.auto_reply, "topic": fb.topic
    }

@app.get("/feedbacks")
def list_feedbacks(limit: int = 500, db: Session = Depends(get_db)):
    rows = db.query(Feedback).order_by(Feedback.ts.desc()).limit(limit).all()
    return [_fmt_fb(r) for r in rows]

@app.get("/feedbacks/me")
def my_feedbacks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Feedback).filter(Feedback.user == current_user.username).order_by(Feedback.ts.desc()).all()
    return [_fmt_fb(r) for r in rows]

@app.get("/notifications/me")
def my_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Feedback).filter(
        Feedback.user == current_user.username,
        not_(Feedback.auto_reply.is_(None)),
        Feedback.auto_reply != ''
    ).order_by(Feedback.ts.desc()).all()
    return [_fmt_fb(r) for r in rows]

@app.get("/stats/overview")
def stats_overview(db: Session = Depends(get_db)):
    seven_days_ago = now_utc() - timedelta(days=7)
    senti_q = db.query(Feedback.senti, func.count(Feedback.id)).group_by(Feedback.senti).all()
    senti_stats = {"POS": 0, "NEU": 0, "NEG": 0}
    for s, c in senti_q:
        if s in senti_stats: senti_stats[s] = c
    cat_q = db.query(Feedback.cat, func.count(Feedback.id)).group_by(Feedback.cat).all()
    cat_stats = {c: count for c, count in cat_q}
    last7_q = db.query(func.date(Feedback.ts), func.count(Feedback.id))\
                .filter(Feedback.ts >= seven_days_ago)\
                .group_by(func.date(Feedback.ts))\
                .order_by(func.date(Feedback.ts)).all()
    last7 = [{"date": d, "count": c} for d, c in last7_q if d]
    neg = db.query(Feedback).filter(Feedback.ts >= seven_days_ago, Feedback.senti == 'NEG').count()
    total = db.query(Feedback).filter(Feedback.ts >= seven_days_ago).count()
    alert = (total > 5 and (neg/total) > 0.4) if total else False
    return {"by_senti": senti_stats, "by_cat": cat_stats, "last7": last7, "alert": alert}

@app.post("/feedbacks")
def create_feedback(payload: FeedbackIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Trả ngay phản hồi AI và thời gian chuẩn giờ Việt Nam.
    """
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(400, "Nội dung trống")

    senti = analyze_sentiment(text)
    cat = classify_category(text)
    ai = generate_ai_response(text, senti)

    fb = Feedback(
        user=current_user.username,
        txt=text, cat=cat, senti=senti,
        img=payload.img,
        auto_reply=ai["auto_reply"], topic=ai["topic"]
    )
    db.add(fb); db.commit(); db.refresh(fb)

    t = fmt_time(fb.ts)
    return {
        "ok": True,
        "id": fb.id,
        "ai_source": ai.get("ai_source", "unknown"),
        "topic": fb.topic,
        "auto_reply": fb.auto_reply,
        "ts": t["ts"], "ts_iso": t["ts_iso"], "ts_epoch": t["ts_epoch"]
    }

@app.post("/feedbacks/{fid}/regen")
def regen_one(fid: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": raise HTTPException(403, "Không có quyền")
    fb = db.query(Feedback).filter(Feedback.id == fid).first()
    if not fb: raise HTTPException(404)
    senti = analyze_sentiment(fb.txt)
    ai = generate_ai_response(fb.txt, senti)
    fb.auto_reply, fb.topic = ai["auto_reply"], ai["topic"]
    db.commit()
    t = fmt_time(fb.ts)
    return {"ok": True, "ai_source": ai.get("ai_source", "unknown"), "topic": ai["topic"],
            "auto_reply": ai["auto_reply"], "ts": t["ts"], "ts_iso": t["ts_iso"], "ts_epoch": t["ts_epoch"]}

@app.post("/feedbacks/regen_all")
def regen_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": raise HTTPException(403, "Không có quyền")
    rows = db.query(Feedback).order_by(Feedback.ts.asc()).all()
    updated = 0
    for fb in rows:
        if not fb.auto_reply or "Lỗi khi tạo phản hồi AI" in (fb.auto_reply or ""):
            senti = analyze_sentiment(fb.txt)
            ai = generate_ai_response(fb.txt, senti)
            fb.auto_reply, fb.topic = ai["auto_reply"], ai["topic"]
            updated += 1
    db.commit()
    return {"ok": True, "updated": updated}

# =============== AI test endpoints ===============
@app.get("/ai/ping")
def ai_ping():
    ok_primary = bool(gemini_primary)
    ok_alt = bool(gemini_alt)
    # thêm server time để bạn kiểm chứng
    t = fmt_time(now_utc())
    return {"ok_primary": ok_primary, "primary": GEMINI_MODEL_NAME,
            "ok_alt": ok_alt, "alt": ALT_STABLE_MODEL,
            "server_time": t}

@app.post("/ai/test")
def ai_test(sample: dict):
    t = (sample.get("text") or "").strip()
    if not t:
        raise HTTPException(400, "Thiếu 'text'")
    if not gemini_primary and not gemini_alt:
        raise HTTPException(503, "Gemini chưa sẵn sàng")
    try:
        r = (gemini_primary or gemini_alt).generate_content(f"Hãy trả về 1 câu chào ngắn gọn dựa trên nội dung: {t}")
        raw = _extract_text(r)
        return {"raw": raw}
    except Exception as e:
        raise HTTPException(502, f"Lỗi gọi Gemini: {e}")

# =============== Upload ===============
@app.post("/upload-image")
def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return {"url": f"/uploads/{name}"}
