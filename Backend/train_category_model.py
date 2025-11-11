import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import json
import os

# --- CẤU HÌNH ---
BASE_MODEL = "5CD-AI/Vietnamese-Sentiment-visobert"
DATA_FILE = "training_data.csv"
OUTPUT_DIR = "./my_custom_category_model"

# --- BƯỚC 1: TẢI VÀ CHUẨN BỊ DỮ LIỆU ---
print(f"Loading data from {DATA_FILE} for category training...")
try:
    df = pd.read_csv(DATA_FILE)
except FileNotFoundError:
    print(f"Error: Data file '{DATA_FILE}' not found. Please create it first.")
    exit()

categories = df['category_label'].unique().tolist()
category_to_id = {cat: i for i, cat in enumerate(categories)}
id_to_category = {str(i): cat for i, cat in enumerate(categories)}

os.makedirs(OUTPUT_DIR, exist_ok=True)
with open(os.path.join(OUTPUT_DIR, "label_map.json"), "w", encoding="utf-8") as f:
    json.dump({'id_to_category': id_to_category, 'category_to_id': category_to_id}, f, ensure_ascii=False, indent=4)

print(f"Found categories: {categories}")

df['label_id'] = df['category_label'].map(category_to_id)
df = df.dropna(subset=['text', 'label_id'])
df['label_id'] = df['label_id'].astype(int)

texts = df['text'].tolist()
labels = df['label_id'].tolist()

train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, labels, test_size=0.2, random_state=42
)

# --- BƯỚC 2: TOKENIZE DỮ LIỆU ---
print(f"Loading tokenizer from {BASE_MODEL}...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=256)
val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=256)

class CategoryDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = CategoryDataset(train_encodings, train_labels)
val_dataset = CategoryDataset(val_encodings, val_labels)

# --- BƯỚC 3: HUẤN LUYỆN MODEL ---
print(f"Loading base model from {BASE_MODEL} for fine-tuning...")
model = AutoModelForSequenceClassification.from_pretrained(
    BASE_MODEL, 
    num_labels=len(categories),
    ignore_mismatched_sizes=True # SỬA LỖI Ở ĐÂY
)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir='./logs_category',
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

print("Starting category model training...")
trainer.train()
print("Training finished!")

# --- BƯỚC 4: LƯU MODEL VÀ TOKENIZER ---
print(f"Saving model and tokenizer to {OUTPUT_DIR}...")
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Category model saved successfully!")