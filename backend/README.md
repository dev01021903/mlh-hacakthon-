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

### 4. Configure Gemini API Key and Models
Open `backend/.env` in your text editor:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_PRIMARY=gemini-2.0-flash
GEMINI_MODEL_FALLBACK=gemini-1.5-flash
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

## 🔍 Verify Gemini Connection & Model Availability

### Step 1: Run Quick Check
Visit [`http://127.0.0.1:8000/api/diagnostics/gemini`](http://127.0.0.1:8000/api/diagnostics/gemini) or run:
```bash
curl http://127.0.0.1:8000/api/diagnostics/gemini
```

### Step 2: Run Detailed Diagnostics
Visit [`http://127.0.0.1:8000/api/diagnostics/gemini-details`](http://127.0.0.1:8000/api/diagnostics/gemini-details) or run:
```bash
curl http://127.0.0.1:8000/api/diagnostics/gemini-details
```

Expected output on success:
```json
{
  "configured": true,
  "configured_model": "gemini-2.0-flash",
  "model_check_passed": true,
  "model_used": "primary",
  "error_category": null,
  "retryable": false,
  "safe_message": "Gemini connection and model check succeeded with primary model."
}
```

### Step 3: Google Cloud / AI Studio Setup (If `permission_denied`)
If you receive `error_category: "permission_denied"`:
1. Ensure your Gemini API Key was generated from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. If using a Google Cloud Project, navigate to **Google Cloud Console** -> **APIs & Services** -> **Enabled APIs & Services**.
3. Search for **Generative Language API** (`generativelanguage.googleapis.com`) and click **Enable**.
4. Wait 1–2 minutes for Google's API authorization to propagate, then re-run the diagnostic check.

---

## 🩺 API Endpoints Overview

1. **`GET /api/diagnostics/gemini`**:
   - Quick connection check with exponential backoff retries for transient issues.

2. **`GET /api/diagnostics/gemini-details`**:
   - Deep diagnostic endpoint reporting error categories (`missing_key`, `invalid_key`, `permission_denied`, `model_unavailable`, `quota_exceeded`, etc.) and fallback testing.

3. **`POST /api/analyze-symptoms`** (Multipart Form Data):
   - `symptom_text` (Required): User-described symptoms.
   - `language` (Optional): English, Hindi, Kannada, Telugu, Tamil.
   - `age_group` (Optional): Child, Adult, Older adult.
   - `duration` (Optional): Started today, 1–3 days, More than 3 days.
   - `symptom_tags` (Optional): JSON string array.
   - `image` (Optional): JPEG, PNG, or WebP up to 5 MB.
   - `document` (Optional): PDF up to 10 MB.
   - **Emergency Override:** Deterministic check executes before any AI call.
   - **Output Sanitization:** Non-diagnostic enforcement.

4. **`POST /api/upload`** (Optional):
   - Securely uploads files to private Supabase bucket and returns a temporary signed URL.

5. **`GET /health`**:
   - Returns `{ "status": "ok" }`.
