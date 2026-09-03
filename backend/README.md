# AMRIT (अमृत) — Backend Architecture & API Reference

> **“Your multilingual guide to the next safe health step.”**  
> Multilingual, multimodal, safety-first health triage API for India powered by **FastAPI**, **Gemini 2.5/2.0**, and **Sarvam AI Translation**.

---

## 🏛️ System Architecture & Separation of Concerns

```
                  ┌────────────────────────────────────────┐
                  │          React TypeScript UI           │
                  │   (No API keys / Server Proxy Only)    │
                  └──────────────────┬─────────────────────┘
                                     │ POST /api/analyze-symptoms
                                     ▼
                  ┌────────────────────────────────────────┐
                  │            FastAPI Backend             │
                  └──────┬──────────────────────────┬──────┘
                         │                          │
        ┌────────────────▼───────────────┐          │
        │ 1. Deterministic Red Flags     │          │
        │    (Immediate 112 / 108 Call)  │          │
        │    *Runs BEFORE any AI model*  │          │
        └────────────────┬───────────────┘          │
                         │ (Non-emergency)          │
        ┌────────────────▼───────────────┐          │
        │ 2. Input Translation           │          │
        │    Sarvam AI: Indic ➔ English  │          │
        └────────────────┬───────────────┘          │
                         │                          │
        ┌────────────────▼───────────────┐          │
        │ 3. Clinical Reasoning          │          │
        │    Google Gemini (in English)  │          │
        │    Non-diagnostic categories   │          │
        └────────────────┬───────────────┘          │
                         │                          │
        ┌────────────────▼───────────────┐          │
        │ 4. Output Sanitization Engine  │          │
        │    Strips prescriptions/doses  │          │
        │    Enforces uncertainty notes  │          │
        └────────────────┬───────────────┘          │
                         │                          │
        ┌────────────────▼───────────────┐          │
        │ 5. Output Display Translation  │          │
        │    Sarvam AI: English ➔ Indic  │          │
        │    (Hindi, Kannada, Telugu, Ta)│          │
        └────────────────┬───────────────┘          │
                         │                          │
                         ▼                          ▼
                  ┌──────────────┐          ┌──────────────┐
                  │ Final Safe   │          │   Private    │
                  │ Triage JSON  │          │   Storage    │
                  └──────────────┘          └──────────────┘
```

1. **Deterministic Red Flags (`backend/utils/red_flags.py`)**: Runs **first** before any Gemini or Sarvam API call. Directly triggers emergency guidance (`112 / 108`) if life-threatening indicators are present.
2. **Sarvam AI Translation (`backend/services/sarvam_translation_service.py`)**: 
   - Translates Indian language user inputs (Hindi, Kannada, Telugu, Tamil) to English for structured Gemini triage reasoning.
   - Translates final sanitized user-facing guidance to the selected Indian language.
   - Preserves emergency phone numbers (`112`, `108`), uncertainty statements, and internal enum codes.
3. **Gemini Clinical Reasoning (`backend/services/gemini_service.py`)**: Generates structured, non-diagnostic triage output in English with broad possible concerns, safe next steps, and general red flags.
4. **Output Sanitization Engine (`backend/utils/output_validation.py`)**: Replaces definitive diagnostic phrases with uncertainty phrasing, blocks prescription medicines/dosages, and attaches standard disclaimers.

---

## 🔑 Environment Configuration

Create or edit `backend/.env`:

```env
# Google Gemini API
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_PRIMARY=gemini-2.5-flash
GEMINI_MODEL_FALLBACK=gemini-1.5-flash

# Sarvam AI Translation (https://dashboard.sarvam.ai/)
SARVAM_API_KEY=your_sarvam_api_key
SARVAM_TRANSLATION_MODEL=sarvam-translate:v1

# Optional Private Cloud Storage (Supabase)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=amrit-health-files
```

> **Security Directives:**
> - `backend/.env` is excluded in `.gitignore`.
> - Never expose `GEMINI_API_KEY` or `SARVAM_API_KEY` in frontend code or `VITE_` variables.

---

## 🌐 Supported Languages & Sarvam Code Mapping

| Language | Native Name | Code | Sarvam Code |
| :--- | :--- | :--- | :--- |
| **English** | English | `en` | `en-IN` |
| **Hindi** | हिन्दी | `hi` | `hi-IN` |
| **Kannada** | ಕನ್ನಡ | `kn` | `kn-IN` |
| **Telugu** | తెలుగు | `te` | `te-IN` |
| **Tamil** | தமிழ் | `ta` | `ta-IN` |

---

## 🚀 API Endpoints

### 1. Server Health
- **`GET /health`** / **`GET /api/health`**
  ```json
  { "status": "ok", "backend": "online" }
  ```

### 2. Diagnostics
- **`GET /api/diagnostics/gemini`**: Minimal live Gemini ping.
- **`GET /api/diagnostics/gemini-details`**: Fine-grained error classification & fallback testing.
- **`GET /api/diagnostics/sarvam`**: Live Sarvam AI translation test using the harmless phrase *"Health guidance is available."*

### 3. Triage & Translation
- **`POST /api/analyze-symptoms`** (Multipart Form):
  - `symptom_text` (str, required)
  - `language` (str, default: "English")
  - `age_group` (str: "Adult", "Child", "Older adult")
  - `duration` (str: "Started today", "1–3 days", "More than 3 days")
  - `symptom_tags` (JSON string array)
  - `image` (Optional file, max 5 MB: JPEG, PNG, WebP)
  - `document` (Optional file, max 10 MB: PDF)

- **`POST /api/translate-triage`** (JSON Body):
  - Translates an existing validated `TriageAnalysisResponse` to a new target language without re-running Gemini.

---

## 🧪 Running Tests

```bash
# Run unit & integration tests for Sarvam translation
.venv/bin/python3 backend/test_sarvam.py

# Run comprehensive development verification suite
.venv/bin/python3 backend/verify_dev_system.py

# Run standalone Gemini CLI probe
.venv/bin/python3 test_gemini.py
```
