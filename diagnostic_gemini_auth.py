#!/usr/bin/env python3
"""
Diagnostic Script for Gemini API Authentication (AQ vs AIza keys).
Tests SDK, Headers (x-goog-api-key), Query Parameters (?key=), and Bearer tokens.
Prints runtime key prefix and raw upstream responses.
"""

import os
import sys
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv

# Step 4: Ensure correct .env is loaded
backend_env = Path(__file__).resolve().parent / "backend" / ".env"
root_env = Path(__file__).resolve().parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env, override=True)
elif root_env.exists():
    load_dotenv(root_env, override=True)

api_key = os.environ.get("GEMINI_API_KEY", "").strip()

print("=" * 65)
print("  STEP 2: RUNTIME KEY IDENTIFICATION")
print("=" * 65)

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY is missing from environment.")
    sys.exit(1)

key_prefix_6 = api_key[:6]
key_len = len(api_key)

print(f"Runtime Key Length: {key_len}")
print(f"First 6 characters: {key_prefix_6}")

if key_prefix_6.startswith("AQ."):
    print("Key Format        : AQ. (New Google Auth / OAuth-style Key)")
elif key_prefix_6.startswith("AIza"):
    print("Key Format        : AIza (Standard / Legacy Gemini API Key)")
else:
    print(f"Key Format        : Other ({key_prefix_6}...)")

print("\n" + "=" * 65)
print("  STEP 3: SDK & REST AUTHENTICATION METHODS TEST")
print("=" * 65)

# Test 1: Modern google-genai SDK
print("\n--- [Test 1: Official google-genai SDK] ---")
try:
    from google import genai
    import importlib.metadata
    sdk_version = importlib.metadata.version("google-genai")
    print(f"google-genai SDK version: {sdk_version}")

    client = genai.Client(api_key=api_key)
    resp = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Reply with the single word 'Connected'."
    )
    print(f"✅ SDK Call Succeeded! Response: {resp.text.strip()}")
except Exception as e:
    print(f"❌ SDK Call Failed:")
    print(f"   Exception Type: {type(e).__name__}")
    print(f"   Exception Str : {e}")
    if hasattr(e, "response"):
        print(f"   Response status: {getattr(e.response, 'status_code', None)}")
        print(f"   Response body  : {getattr(e.response, 'text', None)}")

# Test 2: Raw REST via Header `x-goog-api-key`
print("\n--- [Test 2: REST via Header `x-goog-api-key`] ---")
url_header = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
headers_test = {
    "x-goog-api-key": api_key,
    "Content-Type": "application/json"
}
payload = {
    "contents": [{
        "parts": [{"text": "Reply with the single word 'Connected'."}]
    }]
}

try:
    with httpx.Client(timeout=10.0) as http_client:
        r = http_client.post(url_header, headers=headers_test, json=payload)
        print(f"Status Code: {r.status_code}")
        print(f"Raw Response: {r.text}")
        if r.status_code == 200:
            print("✅ Header Auth Succeeded!")
        else:
            print("❌ Header Auth Failed")
except Exception as e:
    print(f"HTTP Error: {e}")

# Test 3: Raw REST via Query Parameter `?key=`
print("\n--- [Test 3: REST via Query Parameter `?key=`] ---")
url_param = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
try:
    with httpx.Client(timeout=10.0) as http_client:
        r = http_client.post(url_param, headers={"Content-Type": "application/json"}, json=payload)
        print(f"Status Code: {r.status_code}")
        print(f"Raw Response: {r.text}")
        if r.status_code == 200:
            print("✅ Query Param Auth Succeeded!")
        else:
            print("❌ Query Param Auth Failed")
except Exception as e:
    print(f"HTTP Error: {e}")

# Test 4: Raw REST via Authorization Bearer header
print("\n--- [Test 4: REST via Header `Authorization: Bearer <KEY>`] ---")
headers_bearer = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
try:
    with httpx.Client(timeout=10.0) as http_client:
        r = http_client.post(url_header, headers=headers_bearer, json=payload)
        print(f"Status Code: {r.status_code}")
        print(f"Raw Response: {r.text}")
        if r.status_code == 200:
            print("✅ Bearer Auth Succeeded!")
        else:
            print("❌ Bearer Auth Failed")
except Exception as e:
    print(f"HTTP Error: {e}")

print("\n" + "=" * 65)
print("  DIAGNOSTIC TEST COMPLETE")
print("=" * 65)
