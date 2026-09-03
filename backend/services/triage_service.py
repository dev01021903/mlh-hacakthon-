from typing import List, Optional
from models.schemas import TriageAnalysisResponse
from utils.red_flags import check_emergency_red_flags, get_emergency_response
from utils.output_validation import sanitize_and_validate_gemini_output
from .gemini_service import analyze_with_gemini
from .sarvam_translation_service import sarvam_service
from config.languages import normalize_language, get_sarvam_code

def process_symptom_triage(
    symptom_text: str,
    language: str = "English",
    age_group: str = "Adult",
    duration: str = "Started today",
    symptom_tags: List[str] = [],
    image_bytes: Optional[bytes] = None,
    image_content_type: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
) -> TriageAnalysisResponse:
    """
    Main triage processing pipeline:
    1. Normalize selected language
    2. Deterministic Emergency Red Flag check (MUST RUN FIRST, routes to 112/108)
    3. Input localization: Translates non-English user symptoms to English for Gemini
    4. Gemini non-diagnostic reasoning (in English)
    5. Output validation & safety sanitization (in English)
    6. Sarvam AI output translation into the requested Indian language
    """
    display_name, target_code = normalize_language(language)
    has_image = bool(image_bytes)
    has_doc = bool(pdf_bytes)

    # STEP 1: Emergency Override (Deterministic Check)
    if check_emergency_red_flags(symptom_text, symptom_tags):
        emergency_response = get_emergency_response(
            language="English",
            age_group=age_group,
            duration=duration,
            has_image=has_image,
            has_doc=has_doc,
        )
        # Translate to target language without delaying emergency guidance
        return sarvam_service.translate_triage_response(emergency_response, target_code)

    # STEP 2: Translate non-English user symptom input to English for Gemini reasoning
    english_symptom_text = symptom_text
    if target_code != "en-IN" and sarvam_service.is_configured():
        translated_input = sarvam_service.translate_text(
            symptom_text,
            source_language=target_code,
            target_language="en-IN",
        )
        if translated_input:
            english_symptom_text = translated_input

    # STEP 3: Gemini Analysis (Reasoning in English for consistent clinical safety)
    raw_gemini_output = analyze_with_gemini(
        symptom_text=english_symptom_text,
        language="English",
        age_group=age_group,
        duration=duration,
        symptom_tags=symptom_tags,
        image_bytes=image_bytes,
        image_content_type=image_content_type,
        pdf_bytes=pdf_bytes,
    )

    # STEP 4: Validate, Sanitize, and format into schema in English
    english_validated_response = sanitize_and_validate_gemini_output(
        raw_data=raw_gemini_output,
        language="English",
        age_group=age_group,
        duration=duration,
        has_image=has_image,
        has_doc=has_doc,
    )

    # STEP 5: Translate validated user-facing fields to target language using Sarvam AI
    return sarvam_service.translate_triage_response(english_validated_response, target_code)
