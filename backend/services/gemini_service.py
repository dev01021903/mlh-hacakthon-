"""
Gemini Clinical Reasoning Service for AMRIT.
Uses Google Gemini for structured, strictly non-diagnostic triage guidance in English.
Includes resilient retry logic, distinct 401 fail-fast handling, and safe fallbacks.
"""

import os
import json
import io
import time
from typing import Optional, List, Dict, Any, Tuple
from dotenv import load_dotenv

# Modern official Google GenAI SDK
try:
    from google import genai
    from google.genai import types as genai_types
    from google.genai.errors import ClientError, ServerError, APIError
    GENAI_CLIENT_AVAILABLE = True
except ImportError:
    GENAI_CLIENT_AVAILABLE = False

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
9. Return only valid JSON matching the required schema.
10. If information is insufficient, say so and choose a cautious recommendation.
11. When symptoms might be concerning, prioritize CONSULT_SOON or EMERGENCY_NOW.
12. Always include a disclaimer that Amrit does not diagnose conditions or replace a qualified healthcare professional.
"""

JSON_SCHEMA_INSTRUCTION = """
Return ONLY a JSON object matching this schema:
{
  "urgency": "SELF_CARE | CONSULT_SOON | EMERGENCY_NOW",
  "headline": "Short title in English",
  "summary": "Clear, reassuring summary in English",
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
  "emergency_action": "In an emergency, immediately call 112 or 108.",
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
        for idx, page in enumerate(reader.pages[:5]):
            txt = page.extract_text()
            if txt:
                extracted.append(f"--- Page {idx+1} ---\n{txt[:1000]}")
        return "\n".join(extracted)
    except Exception as e:
        print(f"[GeminiService] PDF extraction error: {e}")
        return ""

def classify_gemini_error(err: Exception) -> Tuple[str, bool, str]:
    """
    Categorizes errors safely into standard categories:
    - 401 UNAUTHENTICATED (fail fast, non-retryable)
    - 403 PERMISSION_DENIED (non-retryable)
    - 429 QUOTA_EXCEEDED (non-retryable for demo)
    - 503 SERVICE_UNAVAILABLE (retryable with backoff)
    - NETWORK_ERROR (retryable with backoff)
    """
    err_str = str(err).lower()
    err_type = type(err).__name__

    if "401" in err_str or "unauthenticated" in err_str or "access_token_type_unsupported" in err_str or "api_key_service_blocked" in err_str:
        return (
            "invalid_key",
            False,
            "401 Unauthenticated: The Gemini API key is invalid, expired, or using an unsupported token format. For Google AI Studio, ensure a standard key starting with 'AIzaSy...' is placed in backend/.env.",
        )

    if "403" in err_str or "permission_denied" in err_str or "has not been used in project" in err_str or "is disabled" in err_str:
        return (
            "permission_denied",
            False,
            "403 Permission Denied: Generative Language API is disabled for this project or lacks permission.",
        )

    if "404" in err_str or "not_found" in err_str or "models/" in err_str:
        return (
            "model_unavailable",
            False,
            "The configured Gemini model is not available or not supported for this API key.",
        )

    if "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str:
        return (
            "quota_exceeded",
            False,
            "Gemini API quota or rate limit exceeded. Check quota limits in Google AI Studio.",
        )

    if "503" in err_str or "500" in err_str or "unavailable" in err_str or "service unavailable" in err_str:
        return (
            "service_unavailable",
            True,
            "Gemini service is temporarily unavailable. A retry may succeed shortly.",
        )

    if "timeout" in err_str or "connection" in err_str or "network" in err_str or "dns" in err_str or "connecterror" in err_str:
        return (
            "network_error",
            True,
            "Network connection error while reaching Gemini API endpoints.",
        )

    return (
        "service_unavailable",
        True,
        "Gemini could not be reached. Check API key, API restrictions, model access, quota, and network connection.",
    )

def _execute_genai_call(
    api_key: str,
    model_name: str,
    contents: Any,
    system_instruction: Optional[str] = None,
    json_mode: bool = True,
    max_retries: int = 2,
) -> Optional[str]:
    """
    Executes content generation via the official google-genai SDK.
    Includes fail-fast logic for 401/403 and exponential backoff for 5xx/network errors.
    """
    if not GENAI_CLIENT_AVAILABLE:
        print("[GeminiService] google-genai SDK is not installed.")
        return None

    client = genai.Client(api_key=api_key)
    config = genai_types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.1,
        response_mime_type="application/json" if json_mode else "text/plain",
    )

    delays = [1.0, 2.0]

    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            category, retryable, safe_msg = classify_gemini_error(e)
            
            # Step 7: Fail fast on 401 / 403 without wasting retries
            if not retryable:
                print(f"[GeminiService] Non-retryable error ({category}): {safe_msg}")
                raise e

            if attempt < max_retries:
                delay = delays[attempt]
                print(f"[GeminiService] Transient error ({category}). Retrying in {delay}s (Attempt {attempt+1}/{max_retries})...")
                time.sleep(delay)
            else:
                print(f"[GeminiService] All {max_retries+1} attempts failed with category: {category}")
                raise e

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
    Sends structured triage request with optional image and PDF context to Gemini in English.
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
    - Requested Output Language: English
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
    Includes fail-fast for 401 and exponential backoff retry for transient 503/network errors.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    primary_model = os.environ.get("GEMINI_MODEL_PRIMARY") or os.environ.get("GEMINI_MODEL") or "gemini-2.0-flash"

    if not api_key or not api_key.strip():
        return 503, {
            "configured": False,
            "reachable": False,
            "message": "Gemini API key is missing from backend configuration.",
        }

    test_prompt = "Reply with exactly: GEMINI_CONNECTION_OK"

    try:
        res_text = _execute_genai_call(
            api_key=api_key,
            model_name=primary_model,
            contents=test_prompt,
            json_mode=False,
            max_retries=2,
        )
        if res_text:
            return 200, {
                "configured": True,
                "model": primary_model,
                "reachable": True,
                "response_received": True,
                "message": "Gemini connection is working.",
            }
    except Exception as e:
        cat, retryable, msg = classify_gemini_error(e)
        return 503, {
            "configured": True,
            "reachable": False,
            "error_category": cat,
            "message": msg,
        }

    return 503, {
        "configured": True,
        "reachable": False,
        "message": "Gemini could not be reached.",
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

    # 1. Test Primary Model
    try:
        res_text = _execute_genai_call(
            api_key=api_key,
            model_name=primary_model,
            contents=test_prompt,
            json_mode=False,
            max_retries=1,
        )
        if res_text:
            return 200, {
                "configured": True,
                "configured_model": primary_model,
                "model_check_passed": True,
                "model_used": "primary",
                "error_category": None,
                "retryable": False,
                "safe_message": "Primary Gemini model is reachable and working.",
            }
    except Exception as e:
        cat_primary, retryable_primary, msg_primary = classify_gemini_error(e)

        # 2. Test Fallback Model if enabled and distinct
        if fallback_model and fallback_model != primary_model:
            try:
                res_fallback = _execute_genai_call(
                    api_key=api_key,
                    model_name=fallback_model,
                    contents=test_prompt,
                    json_mode=False,
                    max_retries=1,
                )
                if res_fallback:
                    return 200, {
                        "configured": True,
                        "configured_model": primary_model,
                        "model_check_passed": True,
                        "model_used": "fallback",
                        "fallback_model": fallback_model,
                        "error_category": None,
                        "retryable": False,
                        "safe_message": f"Primary model failed, but fallback model ({fallback_model}) is working.",
                    }
            except Exception:
                pass

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
        "safe_message": "Gemini could not be reached.",
    }
