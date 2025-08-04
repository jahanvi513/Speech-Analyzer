# 🧠 AI Speech Analyzer

AI Speech Analyzer is a web application that allows users to record or upload speech in English or Hindi, get it transcribed using OpenAI Whisper, and receive intelligent feedback and analysis powered by GPT-4.

---

## 🚀 Features

- 🎙️ Record or Upload Audio  
- ✍️ Automatic Transcription via OpenAI Whisper  
- 🧠 AI-Powered Analysis with GPT-4  
- 🌐 Bilingual Support: English & Hindi  
- ⚡ Fast & Lightweight (Flask + Vanilla JS)

---

## ⚙️ Local Setup

### 1. Clone the Repo

```bash
git clone https://github.com/jahanvi513/Speech-Analyzer.git
cd ai-speech-analyzer
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Add OpenAI API Key

Create a file named `config.py` inside the `backend/` folder:

```python
OPENAI_API_KEY = "your-api-key"
```

Or set it as an environment variable:

```bash
# Linux/macOS
export OPENAI_API_KEY="your-api-key"
# Windows CMD
set OPENAI_API_KEY=your-api-key
```

### 5. Run the Flask App

```bash
cd backend
python app.py
```

Now open your browser and visit:  
http://localhost:5000

---

## 🧪 Tech Stack

- Python (Flask)
- HTML/CSS/JS (Vanilla)
- OpenAI Whisper API
- OpenAI GPT-4 API
- Gunicorn (for deployment)

---
