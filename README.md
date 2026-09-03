# AMRIT (अमृत) — Healthcare Triage Web App

> **Tagline:** *“Your multilingual guide to the next safe health step.”*  
> **Mandatory Disclaimer:** *“Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.”*

---

## 🔒 Security & Privacy

- **No Hardcoded Keys**: The Gemini API key is kept server-side only in `backend/.env`.
- **No Client Exposure**: Never place `GEMINI_API_KEY` in `VITE_` variables or React code.
- **Ephemeral Processing**: User images and PDF documents are analyzed in memory and cleaned up immediately.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
# In backend directory
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Insert your GEMINI_API_KEY into backend/.env
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# In project root
npm install
npm run dev
```

---

## 🔍 Verify Gemini Connection

1. Start FastAPI backend (`uvicorn main:app --host 127.0.0.1 --port 8000`).
2. Open [`http://127.0.0.1:8000/api/diagnostics/gemini`](http://127.0.0.1:8000/api/diagnostics/gemini) or use the bottom-left **Developer test** panel in the local frontend UI.
3. Confirm `reachable: true` and `configured: true`.
4. Never share the actual API key.

---

## 🩺 System Features
- **Deterministic Emergency Override**: Urgent symptoms immediately trigger `EMERGENCY_NOW` directing users to **112 / 108**.
- **Non-Diagnostic Concern Categories**: Broad topics with mandatory uncertainty notes (*"Cannot be confirmed from this information alone."*).
- **Multimodal Visual & Document Context**: Contextual image and PDF summarization without diagnostic claims.
- **Safe Medicine Guide**: Pharmacist discussion aid strictly limited to eligible adult self-care cases.
