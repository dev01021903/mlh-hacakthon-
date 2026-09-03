import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_triage_self_care():
    print("Testing Self-Care Case (Hindi)...")
    payload = {
        "language": "hi",
        "age_group": "adult",
        "duration": "today",
        "symptoms_text": "हल्की खांसी और गले में खराश",
        "selected_chips": ["Cough"],
        "agreed_to_disclaimer": True
    }
    r = requests.post(f"{BASE_URL}/api/v1/triage/evaluate", json=payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    print(f" -> Urgency: {data['urgency']}")
    print(f" -> Vernacular Heading: {data['vernacular_guidance']['native_heading']}")
    assert data["urgency"] == "SELF_CARE"
    print(" ✅ Self-Care Test Passed!")

def test_triage_emergency():
    print("\nTesting Emergency Case (English)...")
    payload = {
        "language": "en",
        "age_group": "adult",
        "duration": "today",
        "symptoms_text": "Severe chest pain and difficulty breathing",
        "selected_chips": ["Pain"],
        "agreed_to_disclaimer": True
    }
    r = requests.post(f"{BASE_URL}/api/v1/triage/evaluate", json=payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    print(f" -> Urgency: {data['urgency']}")
    print(f" -> Emergency Red Flags: {len(data['emergency_red_flags'])} detected")
    assert data["urgency"] == "EMERGENCY_NOW"
    print(" ✅ Emergency Test Passed!")

def test_triage_consult():
    print("\nTesting Consult Case (Kannada)...")
    payload = {
        "language": "kn",
        "age_group": "adult",
        "duration": "1-3_days",
        "symptoms_text": "Itchy red rash on arm for 2 days",
        "selected_chips": ["Rash"],
        "agreed_to_disclaimer": True
    }
    r = requests.post(f"{BASE_URL}/api/v1/triage/evaluate", json=payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    print(f" -> Urgency: {data['urgency']}")
    print(f" -> Vernacular Heading: {data['vernacular_guidance']['native_heading']}")
    assert data["urgency"] == "CONSULT_SOON"
    print(" ✅ Consult Test Passed!")

def test_speech_transcribe():
    print("\nTesting Speech Transcribe Endpoint...")
    payload = {
        "audio_base64": "UklGRi...",
        "language_code": "hi",
        "audio_format": "webm"
    }
    r = requests.post(f"{BASE_URL}/api/v1/speech/transcribe", json=payload)
    assert r.status_code == 200
    data = r.json()
    print(f" -> Transcribed Text: {data['transcribed_text']}")
    print(" ✅ Speech Transcribe Test Passed!")

def test_photo_check():
    print("\nTesting Photo Quality Check Endpoint...")
    payload = {
        "image_base64": "data:image/jpeg;base64,..."
    }
    r = requests.post(f"{BASE_URL}/api/v1/vision/check-photo", json=payload)
    assert r.status_code == 200
    data = r.json()
    print(f" -> Quality Assessment: {data['quality_assessment']}")
    print(" ✅ Photo Quality Check Test Passed!")

if __name__ == "__main__":
    print("=" * 50)
    print("Running AMRIT Backend Triage Test Suite")
    print("=" * 50)
    test_triage_self_care()
    test_triage_emergency()
    test_triage_consult()
    test_speech_transcribe()
    test_photo_check()
    print("\n🎉 ALL TEST CASES PASSED PERFECTLY!")
