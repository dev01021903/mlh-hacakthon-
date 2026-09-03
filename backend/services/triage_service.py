from typing import List, Optional
from models.schemas import TriageAnalysisResponse
from utils.red_flags import check_emergency_red_flags, get_emergency_response
from utils.output_validation import sanitize_and_validate_gemini_output
from .gemini_service import analyze_with_gemini

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
    1. Deterministic Emergency Red Flag check (MUST RUN BEFORE GEMINI)
    2. Non-emergency Gemini multimodal triage
    3. Output validation & safety sanitization
    """
    has_image = bool(image_bytes)
    has_doc = bool(pdf_bytes)

    # STEP 1: Emergency Override (Deterministic Check)
    if check_emergency_red_flags(symptom_text, symptom_tags):
        return get_emergency_response(
            language=language,
            age_group=age_group,
            duration=duration,
            has_image=has_image,
            has_doc=has_doc,
        )

    # STEP 2: Gemini Analysis for non-emergency triage
    raw_gemini_output = analyze_with_gemini(
        symptom_text=symptom_text,
        language=language,
        age_group=age_group,
        duration=duration,
        symptom_tags=symptom_tags,
        image_bytes=image_bytes,
        image_content_type=image_content_type,
        pdf_bytes=pdf_bytes,
    )

    # STEP 3: Validate, Sanitize, and format into schema (with safe fallback)
    return sanitize_and_validate_gemini_output(
        raw_data=raw_gemini_output,
        language=language,
        age_group=age_group,
        duration=duration,
        has_image=has_image,
        has_doc=has_doc,
    )
