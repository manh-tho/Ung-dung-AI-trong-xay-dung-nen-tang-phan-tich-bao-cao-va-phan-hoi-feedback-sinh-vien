import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments

# --- CẤU HÌNH ---
BASE_MODEL = "5CD-AI/Vietnamese-Sentiment-visobert"
DATA_FILE = "training_data.csv"
OUTPUT_DIR = "./my_custom_sentiment_model"

# --- BƯỚC 1: TẢI VÀ CHUẨN BỊ DỮ LIỆU ---
print(f"Loading data from {DATA_FILE} for sentiment training...")
try:
    df = pd.read_csv(DATA_FILE)
except FileNotFoundError:
    print(f"Error: Data file '{DATA_FILE}' not found. Please create it first.")
    exit()

# Giữ nguyên tên biến này là 'labels' để định nghĩa các loại cảm xúc
labels = ["Tiêu cực", "Trung lập", "Tích cực"]
label_to_id = {label: i for i, label in enumerate(labels)}

df['label_id'] = df['sentiment_label'].map(label_to_id)
df = df.dropna(subset=['text', 'label_id'])
df['label_id'] = df['label_id'].astype(int)

texts = df['text'].tolist()
# SỬA LỖI: Đổi tên biến này thành 'label_ids' để không bị trùng
label_ids = df['label_id'].tolist()

train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, label_ids, test_size=0.2, random_state=42 # SỬA LỖI: Sử dụng 'label_ids' ở đây
)

# --- BƯỚC 2: TOKENIZE DỮ LIỆU ---
print(f"Loading tokenizer from {BASE_MODEL}...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=256)
val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=256)

class SentimentDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = SentimentDataset(train_encodings, train_labels)
val_dataset = SentimentDataset(val_encodings, val_labels)

# --- BƯỚC 3: HUẤN LUYỆN MODEL ---
print(f"Loading base model from {BASE_MODEL} for fine-tuning...")
model = AutoModelForSequenceClassification.from_pretrained(
    BASE_MODEL,
    num_labels=len(labels), # SỬA LỖI: Ở đây len(labels) sẽ luôn là 3
    ignore_mismatched_sizes=True
)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir='./logs_sentiment',
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

print("Starting sentiment model training...")
trainer.train()
print("Training finished!")

# --- BƯỚC 4: LƯU MODEL VÀ TOKENIZER ---
print(f"Saving model and tokenizer to {OUTPUT_DIR}...")
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Sentiment model saved successfully!")