import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("1. Testing GET /health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert r.json() == {"status": "ok"}
    print(" ✅ Health endpoint OK")

def test_emergency_override():
    print("\n2. Testing Deterministic Emergency Red Flag Override...")
    data = {
        "symptom_text": "Sudden severe chest pain, difficulty breathing and facial swelling",
        "language": "English",
        "age_group": "Adult",
        "duration": "Started today",
        "symptom_tags": json.dumps(["Pain"]),
    }
    r = requests.post(f"{BASE_URL}/api/analyze-symptoms", data=data)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    res = r.json()
    print(f" -> Urgency: {res['urgency']}")
    print(f" -> Headline: {res['headline']}")
    print(f" -> Possible Concerns: {res['possible_concerns']}")
    print(f" -> Medicine Guide Eligible: {res['medicine_guide_eligible']}")
    
    assert res["urgency"] == "EMERGENCY_NOW"
    assert res["possible_concerns"] == []
    assert res["medicine_guide_eligible"] is False
    assert "112" in res["summary"] or "108" in res["summary"]
    print(" ✅ Emergency Override Test Passed!")

def test_multimodal_triage():
    print("\n3. Testing Multimodal Triage with Image and PDF...")
    data = {
        "symptom_text": "Mild red rash on left forearm since yesterday",
        "language": "English",
        "age_group": "Adult",
        "duration": "1–3 days",
        "symptom_tags": json.dumps(["Rash"]),
    }
    files = {
        "image": ("test_sample.png", open("test_sample.png", "rb"), "image/png"),
        "document": ("test_sample.pdf", open("test_sample.pdf", "rb"), "application/pdf"),
    }
    r = requests.post(f"{BASE_URL}/api/analyze-symptoms", data=data, files=files)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    res = r.json()
    print(f" -> Urgency: {res['urgency']}")
    print(f" -> Headline: {res['headline']}")
    print(f" -> Possible Concerns count: {len(res['possible_concerns'])}")
    print(f" -> Image Context Provided: {res['image_context']['provided']}")
    print(f" -> Document Context Provided: {res['document_context']['provided']}")
    print(f" -> Disclaimer: {res['disclaimer']}")

    assert res["image_context"]["provided"] is True
    assert res["document_context"]["provided"] is True
    assert len(res["possible_concerns"]) <= 3
    for c in res["possible_concerns"]:
        assert c["uncertainty_note"] == "Cannot be confirmed from this information alone."
    print(" ✅ Multimodal Triage Test Passed!")

def test_upload_endpoint():
    print("\n4. Testing POST /api/upload...")
    files = {
        "file": ("test_sample.pdf", open("test_sample.pdf", "rb"), "application/pdf"),
    }
    r = requests.post(f"{BASE_URL}/api/upload", files=files)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    res = r.json()
    print(f" -> Storage Path: {res['storage_path']}")
    print(f" -> Content Type: {res['content_type']}")
    print(" ✅ Upload Endpoint Test Passed!")

if __name__ == "__main__":
    print("=" * 60)
    print("Running Full-Stack AMRIT Triage Engine Test Suite")
    print("=" * 60)
    test_health()
    test_emergency_override()
    test_multimodal_triage()
    test_upload_endpoint()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
