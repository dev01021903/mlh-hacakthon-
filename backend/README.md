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

## 🔍 Verify Gemini Connection

Follow these steps to verify your live Gemini AI connection:

1. **Start FastAPI**: Ensure the backend server is running (`uvicorn main:app --host 127.0.0.1 --port 8000`).
2. **Open Diagnostic Endpoint**: Visit [`http://127.0.0.1:8000/api/diagnostics/gemini`](http://127.0.0.1:8000/api/diagnostics/gemini) in your browser or run:
   ```bash
   curl http://127.0.0.1:8000/api/diagnostics/gemini
   ```
3. **Confirm Reachable**: Verify that the JSON response returns:
   ```json
   {
     "configured": true,
     "model": "gemini-2.0-flash",
     "reachable": true,
     "response_received": true,
     "message": "Gemini connection is working."
   }
   ```
4. **Never Share the API Key**: The diagnostic endpoint checks connectivity using a minimal non-diagnostic test prompt without ever exposing keys, headers, or raw upstream errors.

---

## 🩺 API Endpoints Overview

1. **`GET /api/diagnostics/gemini`**:
   - Diagnostic tool for local development to verify Gemini API key, model accessibility, and reachability.

2. **`POST /api/analyze-symptoms`** (Multipart Form Data):
   - `symptom_text` (Required): User-described symptoms.
   - `language` (Optional): English, Hindi, Kannada, Telugu, Tamil.
   - `age_group` (Optional): Child, Adult, Older adult.
   - `duration` (Optional): Started today, 1–3 days, More than 3 days.
   - `symptom_tags` (Optional): JSON string array.
   - `image` (Optional): JPEG, PNG, or WebP up to 5 MB.
   - `document` (Optional): PDF up to 10 MB.
   - **Emergency Override:** If red-flag indicators are present, returns `EMERGENCY_NOW` immediately without querying Gemini.
   - **Output Sanitization:** Strips diagnostic certainty and prescriptions.

3. **`POST /api/upload`** (Optional):
   - Securely uploads files to private Supabase bucket and returns a temporary signed URL.

4. **`GET /health`**:
   - Returns `{ "status": "ok" }`.
