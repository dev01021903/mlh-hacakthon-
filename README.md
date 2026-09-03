<div align="center">
  <img src="public/logo.jpg" alt="AMRIT Logo" width="120" />
  <h1>AMRIT (अमृत)</h1>
  <p><em>Your multilingual guide to the next safe health step.</em></p>
  <p>
    <a href="https://dev01021903.github.io/mlh-hacakthon-/"><strong>View Live Frontend Demo</strong></a>
  </p>
</div>

> **Mandatory Disclaimer:** *Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.*

---

## 🏗 Project Architecture

AMRIT is built with a modern, decoupled architecture:
- **Frontend (`/src`)**: React + TypeScript + Vite + Tailwind CSS. Designed to be mobile-first and highly responsive.
- **Backend (`/backend`)**: Python + FastAPI. Handles AI integration, secure prompt generation, and strict health and safety guardrails.

## 🚀 Live Links
- **Frontend (GitHub Pages)**: [https://dev01021903.github.io/mlh-hacakthon-/](https://dev01021903.github.io/mlh-hacakthon-/)
- **Backend**: Currently configured for local development (`http://localhost:8000`). To make the app fully live, deploy the `backend/` folder to Render or Railway and update `src/services/triageService.ts` with the new URL.

---

## 🛠 Local Setup Instructions

Follow these instructions to run the entire stack on your local machine.

### 1. Start the Backend
The backend requires a Google Gemini API key to evaluate symptoms and generate localized advice.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY!

# Run the FastAPI server (Starts on http://localhost:8000)
python main.py
```

### 2. Start the Frontend
In a new terminal window, start the React development server:

```bash
# Ensure you are in the root directory (not backend/)
npm install

# Start the Vite development server (Starts on http://localhost:5175)
npm run dev
```

---

## 🔒 Security & Privacy Features

- **No Hardcoded Keys**: The Gemini API key is kept server-side only in `backend/.env`. Never expose this in the frontend.
- **Deterministic Emergency Override**: Urgent symptoms bypass the AI and immediately trigger an `EMERGENCY_NOW` alert, directing users to **112 / 108**.
- **Non-Diagnostic Guardrails**: Strict AI prompts prevent the system from diagnosing conditions or recommending unauthorized medications.
