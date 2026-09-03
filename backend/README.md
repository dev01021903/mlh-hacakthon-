# AMRIT Backend (FastAPI + Gemini Triage Engine)

This is the secure backend server for **AMRIT (अमृत)**. It handles deterministic emergency triage overrides, multimodal Gemini analysis, strict output validation, and optional private file storage.

---

## 🔒 Critical Security Notice

> **IMPORTANT:** Never put `GEMINI_API_KEY` in `VITE_` environment variables or anywhere in client-side React code.  
> The Gemini API key is protected server-side and must never be exposed in API responses, logs, or Git commits.

---

## 🚀 Setup & Run Instructions

### 1. Create and Activate Virtual Environment
```bash
# In the project root or backend directory:
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Create `backend/.env` from `backend/.env.example`
```bash
cp backend/.env.example backend/.env
```

### 4. Manually Add Your Gemini API Key
Open `backend/.env` in your text editor and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=amrit-health-files
```

### 5. Run the FastAPI Backend Server
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs).

### 6. Run the Frontend Client
In a separate terminal window:
```bash
npm install
npm run dev
```
Open [`http://127.0.0.1:5173`](http://127.0.0.1:5173) in your browser.

---

## 🩺 API Endpoints Overview

1. **`POST /api/analyze-symptoms`** (Multipart Form Data):
   - `symptom_text` (Required): User-described symptoms.
   - `language` (Optional): English, Hindi, Kannada, Telugu, Tamil.
   - `age_group` (Optional): Child, Adult, Older adult.
   - `duration` (Optional): Started today, 1–3 days, More than 3 days.
   - `symptom_tags` (Optional): JSON string array.
   - `image` (Optional): JPEG, PNG, or WebP up to 5 MB.
   - `document` (Optional): PDF up to 10 MB.
   - **Emergency Override:** If red-flag indicators are present, returns `EMERGENCY_NOW` immediately without querying Gemini.
   - **Output Sanitization:** Strips diagnostic certainty and prescriptions.

2. **`POST /api/upload`** (Optional):
   - Securely uploads files to private Supabase bucket and returns a temporary signed URL.

3. **`GET /health`**:
   - Returns `{ "status": "ok" }`.
