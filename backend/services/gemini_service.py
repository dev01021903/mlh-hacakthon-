import os
import json
import io
import time
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

def classify_gemini_error(error: Exception) -> Tuple[str, bool, str]:
    """
    Classifies errors from Gemini SDK into strict, safe categories.
    Returns: (error_category, retryable, safe_message)
    Never exposes API keys, auth headers, or raw request/response bodies.
    """
    err_str = str(error).lower()
    err_type = type(error).__name__.lower()

    if "api_key" in err_str and ("missing" in err_str or "not set" in err_str):
        return (
            "missing_key",
            False,
            "Gemini API key is missing from backend configuration.",
        )

    if "401" in err_str or "unauthenticated" in err_str or "api_key_invalid" in err_str or "invalid api key" in err_str:
        return (
            "invalid_key",
            False,
            "Gemini API key is invalid or unrecognized. Please check your API key in backend/.env.",
        )

    if "403" in err_str or "permission_denied" in err_str or "service_disabled" in err_str or "not been used in project" in err_str:
        return (
            "permission_denied",
            False,
            "Gemini API (generativelanguage.googleapis.com) is disabled for this project or restricted. Enable it in Google Cloud Console / AI Studio.",
        )

    if "404" in err_str or "not found" in err_str or "is not supported" in err_str or "model" in err_str and "unavailable" in err_str:
        return (
            "model_unavailable",
            False,
            "The configured Gemini model is unavailable or incorrectly configured for this API key.",
        )

    if "429" in err_str or "resource_exhausted" in err_str or "quota" in err_str or "rate limit" in err_str:
        return (
            "quota_exceeded",
            False,
            "Gemini API quota or rate limit exceeded. Check your plan or quota limits in Google AI Studio / GCP.",
        )

    if "503" in err_str or "unavailable" in err_str or "service unavailable" in err_str or "500" in err_str:
        return (
            "service_unavailable",
            True,
            "Gemini service is temporarily unavailable. A retry may succeed shortly.",
        )

    if "timeout" in err_str or "connection" in err_str or "network" in err_str or "dns" in err_str or "httpx" in err_type:
        return (
            "network_error",
            True,
            "Network connection error while reaching Gemini API endpoints.",
        )

    if "400" in err_str or "invalid_argument" in err_str:
        return (
            "invalid_request",
            False,
            "Invalid request parameters sent to Gemini API.",
        )

    return (
        "service_unavailable",
        True,
        "Gemini could not be reached. Check API key, API restrictions, model access, quota, and network connection.",
    )

def _execute_genai_call(api_key: str, model_name: str, contents: Any, system_instruction: Optional[str] = None, json_mode: bool = True) -> Optional[str]:
    """Helper executing content generation via modern or legacy SDK."""
    # 1. Modern SDK
    if GENAI_CLIENT_AVAILABLE:
        client = genai.Client(api_key=api_key)
        config = None
        if system_instruction or json_mode:
            config = genai_types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json" if json_mode else "text/plain",
            )
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )
        if response and response.text:
            return response.text

    # 2. Legacy SDK Fallback
    if LEGACY_GENAI_AVAILABLE:
        legacy_genai.configure(api_key=api_key)
        gen_model = legacy_genai.GenerativeModel(
            model_name,
            system_instruction=system_instruction,
            generation_config={"temperature": 0.1, "response_mime_type": "application/json" if json_mode else "text/plain"} if json_mode else None,
        )
        resp = gen_model.generate_content(contents)
        if resp and resp.text:
            return resp.text

    return None

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
    Supports primary model with configurable fallback.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        print("[GeminiService] GEMINI_API_KEY is not configured in backend/.env.")
        return None

    primary_model = os.environ.get("GEMINI_MODEL_PRIMARY") or os.environ.get("GEMINI_MODEL") or "gemini-2.0-flash"
    fallback_model = os.environ.get("GEMINI_MODEL_FALLBACK") or "gemini-1.5-flash"

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

    models_to_try = [primary_model]
    if fallback_model and fallback_model != primary_model:
        models_to_try.append(fallback_model)

    for model_name in models_to_try:
        try:
            contents: List[Any] = []
            if image_bytes and image_content_type and GENAI_CLIENT_AVAILABLE:
                contents.append(
                    genai_types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=image_content_type,
                    )
                )
            elif image_bytes and image_content_type:
                contents.append({"mime_type": image_content_type, "data": image_bytes})

            contents.append(prompt_text)

            res_text = _execute_genai_call(
                api_key=api_key,
                model_name=model_name,
                contents=contents,
                system_instruction=SYSTEM_INSTRUCTION,
                json_mode=True,
            )
            if res_text:
                return json.loads(res_text)
        except Exception as e:
            cat, _, _ = classify_gemini_error(e)
            print(f"[GeminiService] Model {model_name} failed with category: {cat}")
            continue

    return None

def test_gemini_connection() -> Tuple[int, Dict[str, Any]]:
    """
    Standard GET /api/diagnostics/gemini endpoint implementation.
    Includes exponential backoff retry for transient 503/network errors.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    primary_model = os.environ.get("GEMINI_MODEL_PRIMARY") or os.environ.get("GEMINI_MODEL") or "gemini-2.0-flash"

    if not api_key or not api_key.strip():
        print("Gemini diagnostic failed: missing_key")
        return 503, {
            "configured": False,
            "reachable": False,
            "message": "Gemini API key is missing from backend configuration.",
        }

    print("Gemini diagnostic started")
    test_prompt = "Reply with exactly: GEMINI_CONNECTION_OK"

    backoff_delays = [1.0, 2.0, 4.0]
    last_error_category = "service_unavailable"
    last_safe_message = "Gemini could not be reached. Check API key, API restrictions, model access, quota, and network connection."

    for attempt, delay in enumerate(backoff_delays, start=1):
        try:
            res_text = _execute_genai_call(
                api_key=api_key,
                model_name=primary_model,
                contents=test_prompt,
                json_mode=False,
            )
            if res_text:
                print("Gemini diagnostic succeeded")
                return 200, {
                    "configured": True,
                    "model": primary_model,
                    "reachable": True,
                    "response_received": True,
                    "message": "Gemini connection is working.",
                }
        except Exception as e:
            cat, retryable, msg = classify_gemini_error(e)
            last_error_category = cat
            last_safe_message = msg

            if not retryable:
                print(f"Gemini diagnostic failed: {cat}")
                return 503, {
                    "configured": True,
                    "reachable": False,
                    "message": msg,
                }

            print(f"Gemini diagnostic retry {attempt}/3 after delay {delay}s due to: {cat}")
            if attempt < len(backoff_delays):
                time.sleep(delay)

    print(f"Gemini diagnostic failed: {last_error_category}")
    return 503, {
        "configured": True,
        "reachable": False,
        "message": last_safe_message,
    }

def test_gemini_connection_details() -> Tuple[int, Dict[str, Any]]:
    """
    Detailed GET /api/diagnostics/gemini-details endpoint implementation.
    Tests primary model and fallback model, distinguishing detailed error categories.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    primary_model = os.environ.get("GEMINI_MODEL_PRIMARY") or os.environ.get("GEMINI_MODEL") or "gemini-2.0-flash"
    fallback_model = os.environ.get("GEMINI_MODEL_FALLBACK") or "gemini-1.5-flash"

    if not api_key or not api_key.strip():
        return 503, {
            "configured": False,
            "configured_model": primary_model,
            "model_check_passed": False,
            "error_category": "missing_key",
            "retryable": False,
            "safe_message": "Gemini API key is missing from backend configuration.",
        }

    test_prompt = "Reply with exactly: GEMINI_CONNECTION_OK"

    # Attempt Primary Model
    try:
        res = _execute_genai_call(api_key=api_key, model_name=primary_model, contents=test_prompt, json_mode=False)
        if res:
            return 200, {
                "configured": True,
                "configured_model": primary_model,
                "model_check_passed": True,
                "model_used": "primary",
                "error_category": None,
                "retryable": False,
                "safe_message": "Gemini connection and model check succeeded with primary model.",
            }
    except Exception as e_primary:
        cat_primary, retryable_primary, msg_primary = classify_gemini_error(e_primary)

        # If primary model is unavailable or permissions issue on model, attempt fallback model
        if fallback_model and fallback_model != primary_model and cat_primary in ["model_unavailable", "service_unavailable"]:
            try:
                res_fallback = _execute_genai_call(api_key=api_key, model_name=fallback_model, contents=test_prompt, json_mode=False)
                if res_fallback:
                    return 200, {
                        "configured": True,
                        "configured_model": primary_model,
                        "model_check_passed": True,
                        "model_used": "fallback",
                        "fallback_model": fallback_model,
                        "error_category": None,
                        "retryable": False,
                        "safe_message": f"Primary model was unavailable; successfully connected using fallback model ({fallback_model}).",
                    }
            except Exception as e_fallback:
                cat_fb, retryable_fb, msg_fb = classify_gemini_error(e_fallback)
                return 503, {
                    "configured": True,
                    "configured_model": primary_model,
                    "model_check_passed": False,
                    "error_category": cat_fb,
                    "retryable": retryable_fb,
                    "safe_message": msg_fb,
                }

        return 503, {
            "configured": True,
            "configured_model": primary_model,
            "model_check_passed": False,
            "error_category": cat_primary,
            "retryable": retryable_primary,
            "safe_message": msg_primary,
        }

    return 503, {
        "configured": True,
        "configured_model": primary_model,
        "model_check_passed": False,
        "error_category": "service_unavailable",
        "retryable": True,
        "safe_message": "Gemini service could not be reached.",
    }
