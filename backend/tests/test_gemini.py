#!/usr/bin/env python3
"""
Standalone CLI Test Script for Gemini API Connection in AMRIT.
Loads GEMINI_API_KEY from backend/.env and executes an isolated test call.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Step 1: Load environment safely
backend_dir = Path(__file__).resolve().parent / "backend"
backend_env = backend_dir / ".env"
root_env = Path(__file__).resolve().parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env, override=True)
elif root_env.exists():
    load_dotenv(root_env, override=True)
else:
    load_dotenv(override=True)

api_key = os.environ.get("GEMINI_API_KEY", "").strip()
model_name = os.environ.get("GEMINI_MODEL") or os.environ.get("GEMINI_MODEL_PRIMARY") or "gemini-2.0-flash"

print("=" * 60)
print("  AMRIT — Gemini API CLI Connection Test")
print("=" * 60)

if not api_key:
    print("❌ Error: GEMINI_API_KEY is not defined in .env file.")
    print("   Please create backend/.env and add:")
    print("   GEMINI_API_KEY=AIzaSy...your_gemini_api_key")
    sys.exit(1)

masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
print(f"✅ GEMINI_API_KEY detected in environment (Length: {len(api_key)}, Prefix: {api_key[:6]}, Masked: {masked_key})")
print(f"📡 Target model: {model_name}")
print("💬 Sending test prompt: \"Respond with the single word 'Connected'.\"...\n")

try:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model_name,
        contents="Respond with the single word 'Connected'.",
    )

    if response and response.text:
        print("🎉 SUCCESS: Gemini connection verified!")
        print(f"   Model Response: \"{response.text.strip()}\"")
        print("   Status: Operational")
        sys.exit(0)
    else:
        print("⚠️ Warning: Empty response received from Gemini model.")
        sys.exit(1)

except Exception as e:
    err_msg = str(e)
    err_lower = err_msg.lower()

    print("❌ Gemini Connection Failed:")

    if "401" in err_msg or "unauthenticated" in err_lower or "access_token_type_unsupported" in err_lower or "api_key_service_blocked" in err_lower:
        print("   [401 Unauthenticated / Invalid Key Format]")
        print(f"   Key Prefix: {api_key[:6]}")
        if api_key.startswith("AQ."):
            print("   Cause: An 'AQ.' OAuth/Auth token was provided instead of a standard Google AI Studio API key.")
            print("   Fix  : Go to https://aistudio.google.com/app/apikey, create an API key (starts with 'AIzaSy...'), and paste it into backend/.env.")
        else:
            print("   Cause: The API key provided is expired, invalid, or truncated.")
            print("   Fix  : Verify that the full API key starting with 'AIzaSy...' is pasted accurately in backend/.env.")

    elif "403" in err_msg or "permission_denied" in err_lower or "has not been used in project" in err_lower:
        print("   [403 Permission Denied]")
        print("   Cause: Generative Language API is not enabled for this GCP project, or lacks permission.")
        print("   Fix  : Enable 'generativelanguage.googleapis.com' in Google Cloud Console, or generate a fresh key from Google AI Studio.")

    elif "429" in err_msg or "quota" in err_lower or "resource_exhausted" in err_lower:
        print("   [429 Rate Limit / Quota Exceeded]")
        print("   Cause: The API key has exceeded its rate limit or project quota.")
        print("   Fix  : Wait 60 seconds before retrying, or check quota limits in Google AI Studio.")

    elif "connecterror" in err_lower or "timeout" in err_lower or "dns" in err_lower or "network" in err_lower:
        print("   [Network Connection Error]")
        print("   Cause: Could not reach Google API endpoints.")
        print("   Fix  : Check internet access and firewall/proxy settings.")

    else:
        print(f"   [General Error]: {type(e).__name__}")
        print(f"   Details: {err_msg}")

    sys.exit(1)
