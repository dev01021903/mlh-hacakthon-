import requests
import json
import io

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("1. Testing GET /health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert r.json() == {"status": "ok"}
    print(" ✅ Health endpoint OK")

def test_gemini_diagnostics():
    print("\n2. Testing GET /api/diagnostics/gemini & gemini-details...")
    r_diag = requests.get(f"{BASE_URL}/api/diagnostics/gemini")
    print(f" -> Quick Diagnostic status: {r_diag.status_code}, data: {r_diag.json()}")
    assert "configured" in r_diag.json()

    r_details = requests.get(f"{BASE_URL}/api/diagnostics/gemini-details")
    print(f" -> Details Diagnostic status: {r_details.status_code}, data: {r_details.json()}")
    det = r_details.json()
    assert "configured" in det
    assert "configured_model" in det
    assert "error_category" in det
    assert "safe_message" in det
    print(" ✅ Diagnostic Endpoints Tested Successfully!")

def test_emergency_override():
    print("\n3. Testing Deterministic Emergency Red Flag Override...")
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
    print("\n4. Testing Multimodal Triage with in-memory Image and PDF...")
    data = {
        "symptom_text": "Mild red rash on left forearm since yesterday, slightly itchy",
        "language": "English",
        "age_group": "Adult",
        "duration": "1–3 days",
        "symptom_tags": json.dumps(["Rash"]),
    }
    
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    pdf_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 100 100]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"

    files = {
        "image": ("sample_skin.png", io.BytesIO(png_bytes), "image/png"),
        "document": ("sample_summary.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
    }
    r = requests.post(f"{BASE_URL}/api/analyze-symptoms", data=data, files=files)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    res = r.json()
    print(f" -> Urgency: {res['urgency']}")
    print(f" -> Headline: {res['headline']}")
    print(f" -> Summary: {res['summary']}")
    print(f" -> Possible Concerns count: {len(res['possible_concerns'])}")
    print(f" -> Image Context Provided: {res['image_context']['provided']}")
    print(f" -> Document Context Provided: {res['document_context']['provided']}")
    print(f" -> Disclaimer: {res['disclaimer']}")

    assert res["image_context"]["provided"] is True
    assert res["document_context"]["provided"] is True
    assert len(res["possible_concerns"]) <= 3
    print(" ✅ Multimodal Triage Test Passed!")

def test_upload_endpoint():
    print("\n5. Testing POST /api/upload...")
    pdf_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 100 100]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    files = {
        "file": ("session_doc.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
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
    test_gemini_diagnostics()
    test_emergency_override()
    test_multimodal_triage()
    test_upload_endpoint()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
