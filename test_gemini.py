#!/usr/bin/env python3
"""
Standalone CLI Test Script for Gemini API Connection.
Verifies GEMINI_API_KEY loading and makes a lightweight test call.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Try loading from backend/.env first, then root .env
backend_env = Path(__file__).resolve().parent / "backend" / ".env"
root_env = Path(__file__).resolve().parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
else:
    load_dotenv()

def main():
    print("=" * 60)
    print("  AMRIT — Gemini API CLI Connection Test")
    print("=" * 60)

    # 1. Verify GEMINI_API_KEY presence
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        print("❌ Error: GEMINI_API_KEY is not defined in .env file.")
        print("   Please create backend/.env or .env with:")
        print("   GEMINI_API_KEY=your_gemini_api_key_here")
        sys.exit(1)

    # Key present (mask for display: never reveal the key)
    masked_key = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else "***"
    print(f"✅ GEMINI_API_KEY detected in environment (Length: {len(api_key)}, Key: {masked_key})")

    # 2. Configure model
    model_name = os.environ.get("GEMINI_MODEL") or os.environ.get("GEMINI_MODEL_PRIMARY") or "gemini-2.5-flash"
    print(f"📡 Target model: {model_name}")

    # 3. Test Gemini SDK Call
    test_prompt = "Respond with the single word 'Connected'."
    print(f"💬 Sending test prompt: \"{test_prompt}\"...")

    # Try modern google-genai SDK
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # Try target model, fallback to 2.0-flash / 1.5-flash if needed
        models_to_try = [model_name, "gemini-2.0-flash", "gemini-1.5-flash"]
        # Remove duplicates while preserving order
        models_to_try = list(dict.fromkeys(models_to_try))
        
        last_error = None
        for m in models_to_try:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=test_prompt,
                )
                if response and response.text:
                    clean_reply = response.text.strip()
                    print("\n🎉 SUCCESS: Communication with Gemini established!")
                    print(f"   Model used : {m}")
                    print(f"   Response   : \"{clean_reply}\"")
                    return
            except Exception as inner_e:
                last_error = inner_e
                err_str = str(inner_e).lower()
                if "404" in err_str or "not found" in err_str:
                    print(f"   Model {m} not found, attempting fallback...")
                    continue
                else:
                    break

        if last_error:
            raise last_error

    except ImportError:
        # Fallback to legacy google.generativeai if google-genai is missing
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            m = legacy_genai.GenerativeModel("gemini-1.5-flash")
            response = m.generate_content(test_prompt)
            if response and response.text:
                print("\n🎉 SUCCESS: Communication with Gemini established (Legacy SDK)!")
                print(f"   Response: \"{response.text.strip()}\"")
                return
        except Exception as legacy_err:
            format_and_print_error(legacy_err)
            sys.exit(1)
            
    except Exception as e:
        format_and_print_error(e)
        sys.exit(1)

def format_and_print_error(error: Exception):
    err_str = str(error)
    err_lower = err_str.lower()
    
    print("\n❌ Gemini Connection Failed:")
    
    if "403" in err_str or "permission_denied" in err_lower or "service_disabled" in err_lower:
        print("   [403 Permission Denied]")
        print("   Cause: The Generative Language API (generativelanguage.googleapis.com) is not enabled")
        print("          for this Google Cloud project or key.")
        print("   Fix  : 1. Generate a key from Google AI Studio (https://aistudio.google.com/app/apikey).")
        print("          2. Or enable 'Generative Language API' in Google Cloud Console.")
    elif "429" in err_str or "resource_exhausted" in err_lower:
        print("   [429 Rate Limit / Quota Exceeded]")
        print("   Cause: You have hit the rate limit or quota limit for your Gemini API tier.")
        print("   Fix  : Wait a few seconds or check quota settings in Google AI Studio / GCP.")
    elif "401" in err_str or "unauthenticated" in err_lower:
        print("   [401 Unauthenticated / Invalid Key]")
        print("   Cause: The GEMINI_API_KEY provided is invalid or malformed.")
        print("   Fix  : Verify that the full API key is pasted accurately in backend/.env.")
    elif "timeout" in err_lower or "connection" in err_lower or "network" in err_lower:
        print("   [Network / Connection Error]")
        print("   Cause: Could not connect to Google API endpoints.")
        print("   Fix  : Check your internet connection or proxy settings.")
    else:
        print(f"   [General Error]: {type(error).__name__}")
        print(f"   Details: {err_str[:200]}")

if __name__ == "__main__":
    main()
