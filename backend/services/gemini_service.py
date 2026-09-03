import os
import json
import io
from typing import Optional, List, Dict, Any, Tuple
from dotenv import load_dotenv

# Try importing google.genai or google.generativeai
try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_CLIENT_AVAILABLE = True
except ImportError:
    GENAI_CLIENT_AVAILABLE = False

try:
    import google.generativeai as legacy_genai
    LEGACY_GENAI_AVAILABLE = True
except ImportError:
    LEGACY_GENAI_AVAILABLE = False

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

load_dotenv()

SYSTEM_INSTRUCTION = """
You are Amrit, a safety-first health triage support system for India. You are not a doctor and you must not diagnose a disease.

Your task is to provide general health triage guidance from self-reported symptoms and optional image/PDF context.

Rules:
1. Never state or imply that the user definitively has a disease.
2. Never use language such as "You have," "This is," "Diagnosed with," or "Confirmed."
3. At most provide up to 3 broad "possible concern categories" that a user can discuss with a clinician, such as:
   - "Skin irritation or rash-related concern"
   - "Upper respiratory symptom concern"
   - "Gastrointestinal symptom concern"
   - "Eye irritation concern"
   - "Musculoskeletal discomfort concern"
4. Every possible concern category must include:
   "Cannot be confirmed from this information alone."
5. Do not name high-risk diseases or rare diseases unless the user explicitly reports a clinician-confirmed diagnosis in the input.
6. Do not prescribe medication, list drug brands, suggest dosage, or recommend antibiotics, steroids, sedatives, or prescription medicines.
7. For images:
   - Describe only general visible features that are relevant to triage (e.g., redness, localized swelling, dry skin patch).
   - State that image quality, lighting, and lack of physical examination limit assessment.
   - Never identify a disease from an image.
8. For PDFs:
   - Treat them as user-provided context only.
   - Summarize only relevant plain-language information.
   - Do not interpret a prescription, test report, radiology result, or medical record as a diagnosis.
   - Recommend professional review for medical documents.
9. Use simple language appropriate for the requested output language.
10. Return only valid JSON matching the required schema.
11. If information is insufficient, say so and choose a cautious recommendation.
12. When symptoms might be concerning, prioritize CONSULT_SOON or EMERGENCY_NOW.
13. Always include a disclaimer that Amrit does not diagnose conditions or replace a qualified healthcare professional.
"""

JSON_SCHEMA_INSTRUCTION = """
Return ONLY a JSON object matching this schema:
{
  "urgency": "SELF_CARE | CONSULT_SOON | EMERGENCY_NOW",
  "headline": "Short title in the requested language",
  "summary": "Clear, reassuring summary in the requested language",
  "possible_concerns": [
    {
      "category": "Broad concern category (e.g. Skin irritation or rash-related concern)",
      "uncertainty_note": "Cannot be confirmed from this information alone."
    }
  ],
  "image_context": {
    "provided": true,
    "quality": "not_provided | limited | usable",
    "observation": "General non-diagnostic observation of visible features",
    "limitation": "Image quality, lighting, and lack of physical examination limit assessment. Never a diagnosis."
  },
  "document_context": {
    "provided": true,
    "summary": "Plain language context summary",
    "limitation": "Medical documents cannot be clinically interpreted online. A clinician must review all reports directly."
  },
  "safe_next_steps": ["Step 1", "Step 2", "Step 3"],
  "red_flags": ["Red flag 1", "Red flag 2"],
  "medicine_guide_eligible": true,
  "disclaimer": "Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional."
}
"""

def extract_pdf_text_in_memory(pdf_bytes: bytes) -> str:
    """Extracts text from PDF bytes safely in memory."""
    if not PYPDF_AVAILABLE or not pdf_bytes:
        return ""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted = []
        for page in reader.pages[:5]:  # Process up to first 5 pages for context
            text = page.extract_text()
            if text:
                extracted.append(text)
        return "\n".join(extracted)[:3000]  # Limit length for security and context
    except Exception as e:
        print(f"[GeminiService] PDF extraction note: {e}")
        return ""

def analyze_with_gemini(
    symptom_text: str,
    language: str,
    age_group: str,
    duration: str,
    symptom_tags: List[str],
    image_bytes: Optional[bytes] = None,
    image_content_type: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
) -> Optional[Dict[str, Any]]:
    """
    Sends structured triage request with optional image and PDF context to Gemini.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        print("[GeminiService] GEMINI_API_KEY is not configured in backend/.env.")
        return None

    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    # Prepare PDF context if supplied
    pdf_text_context = ""
    if pdf_bytes:
        extracted = extract_pdf_text_in_memory(pdf_bytes)
        if extracted:
            pdf_text_context = f"\nUser Attached PDF Document Content (for context only):\n{extracted}\n"

    # Construct Prompt
    prompt_text = f"""
    Please evaluate the following user symptom report:
    - Symptoms: {symptom_text}
    - Common Symptom Tags: {", ".join(symptom_tags) if symptom_tags else "None"}
    - Duration: {duration}
    - Age Group: {age_group}
    - Requested Output Language: {language}
    - Image Attached: {"Yes (inspect provided image data)" if image_bytes else "No"}
    - Document Attached: {"Yes" if pdf_bytes else "No"}
    {pdf_text_context}

    {JSON_SCHEMA_INSTRUCTION}
    """

    # 1. Try google-genai modern SDK
    if GENAI_CLIENT_AVAILABLE:
        try:
            client = genai.Client(api_key=api_key)
            contents: List[Any] = []

            if image_bytes and image_content_type:
                contents.append(
                    genai_types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=image_content_type,
                    )
                )

            contents.append(prompt_text)

            config = genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                response_mime_type="application/json",
            )

            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )

            if response and response.text:
                return json.loads(response.text)
        except Exception as e:
            print(f"[GeminiService] google.genai error with model {model_name}: {e}")

    # 2. Try legacy google.generativeai SDK fallback
    if LEGACY_GENAI_AVAILABLE:
        try:
            legacy_genai.configure(api_key=api_key)
            for m in [model_name, "gemini-1.5-flash"]:
                try:
                    gen_model = legacy_genai.GenerativeModel(
                        m,
                        system_instruction=SYSTEM_INSTRUCTION,
                        generation_config={
                            "temperature": 0.1,
                            "response_mime_type": "application/json",
                        },
                    )

                    content_parts: List[Any] = []
                    if image_bytes and image_content_type:
                        content_parts.append({
                            "mime_type": image_content_type,
                            "data": image_bytes,
                        })
                    content_parts.append(prompt_text)

                    resp = gen_model.generate_content(content_parts)
                    if resp and resp.text:
                        return json.loads(resp.text)
                except Exception as inner_e:
                    print(f"[GeminiService] legacy model {m} attempt: {inner_e}")
                    continue
        except Exception as e:
            print(f"[GeminiService] legacy google.generativeai error: {e}")

    return None

def test_gemini_connection() -> Tuple[int, Dict[str, Any]]:
    """
    Local-development-only Gemini connection test.
    Makes one minimal request to verify connectivity and API key validity.
    Returns (status_code, safe_response_dict).
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    if not api_key or not api_key.strip():
        print("Gemini diagnostic failed: missing_key")
        return 503, {
            "configured": False,
            "reachable": False,
            "message": "Gemini API key is missing from backend configuration.",
        }

    print("Gemini diagnostic started")
    test_prompt = "Reply with exactly: GEMINI_CONNECTION_OK"

    # 1. Try google.genai client
    if GENAI_CLIENT_AVAILABLE:
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=model_name,
                contents=test_prompt,
            )
            if response and response.text:
                print("Gemini diagnostic succeeded")
                return 200, {
                    "configured": True,
                    "model": model_name,
                    "reachable": True,
                    "response_received": True,
                    "message": "Gemini connection is working.",
                }
        except Exception as e:
            err_str = str(e).lower()
            if "not found" in err_str or "404" in err_str or "is not supported" in err_str:
                print("Gemini diagnostic failed: model_unavailable")
                return 503, {
                    "configured": True,
                    "reachable": False,
                    "message": "Gemini model is unavailable or incorrectly configured.",
                }
            print("Gemini diagnostic failed: authentication_or_quota")

    # 2. Try legacy SDK fallback
    if LEGACY_GENAI_AVAILABLE:
        try:
            legacy_genai.configure(api_key=api_key)
            gen_model = legacy_genai.GenerativeModel(model_name)
            resp = gen_model.generate_content(test_prompt)
            if resp and resp.text:
                print("Gemini diagnostic succeeded")
                return 200, {
                    "configured": True,
                    "model": model_name,
                    "reachable": True,
                    "response_received": True,
                    "message": "Gemini connection is working.",
                }
        except Exception as e:
            err_str = str(e).lower()
            if "not found" in err_str or "404" in err_str or "is not supported" in err_str:
                print("Gemini diagnostic failed: model_unavailable")
                return 503, {
                    "configured": True,
                    "reachable": False,
                    "message": "Gemini model is unavailable or incorrectly configured.",
                }
            print("Gemini diagnostic failed: authentication_or_quota")

    return 503, {
        "configured": True,
        "reachable": False,
        "message": "Gemini could not be reached. Check API key, API restrictions, model access, quota, and network connection.",
    }
