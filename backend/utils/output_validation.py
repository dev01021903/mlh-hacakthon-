import re
from typing import Any, Dict, List
from models.schemas import (
    UrgencyEnum,
    PossibleConcern,
    ImageContext,
    DocumentContext,
    TriageAnalysisResponse,
)
from utils.red_flags import GENERAL_RED_FLAGS

CERTAINTY_PATTERNS = [
    re.compile(r"\byou have\b", re.IGNORECASE),
    re.compile(r"\bthis is\b", re.IGNORECASE),
    re.compile(r"\bdiagnosed with\b", re.IGNORECASE),
    re.compile(r"\bconfirmed\b", re.IGNORECASE),
    re.compile(r"\bdefinite(ly)?\b", re.IGNORECASE),
]

FORBIDDEN_MEDICINE_PATTERNS = [
    re.compile(r"\b(take|prescribe|dosage|dose|mg|ml|tablets?|capsules?|antibiotic|steroid|sedative)\b", re.IGNORECASE),
    re.compile(r"\b(amoxicillin|azithromycin|ciprofloxacin|doxycycline|paracetamol|ibuprofen|dexamethasone|prednisolone|alprazolam|diazepam)\b", re.IGNORECASE),
]

def sanitize_text(text: str) -> str:
    """
    Strips away any phrasing that implies medical certainty or diagnostic claims.
    """
    cleaned = text
    for pattern in CERTAINTY_PATTERNS:
        cleaned = pattern.sub("possible concern relates to", cleaned)
    return cleaned

def sanitize_and_validate_gemini_output(
    raw_data: Any,
    language: str = "English",
    age_group: str = "Adult",
    duration: str = "Started today",
    has_image: bool = False,
    has_doc: bool = False,
) -> TriageAnalysisResponse:
    """
    Validates, sanitizes, and schemas raw Gemini output before returning to frontend.
    Falls back safely if output is malformed or violates non-diagnostic rules.
    """
    fallback_response = TriageAnalysisResponse(
        urgency=UrgencyEnum.CONSULT_SOON,
        headline="Consult a doctor soon",
        summary="We could not safely interpret all of the information. A qualified healthcare professional can help assess your symptoms.",
        possible_concerns=[],
        image_context=ImageContext(
            provided=has_image,
            quality="limited" if has_image else "not_provided",
            observation="Visual context could not be safely verified.",
            limitation="A physical examination by a healthcare professional is recommended.",
        ),
        document_context=DocumentContext(
            provided=has_doc,
            summary="Document review could not be safely interpreted." if has_doc else "No document provided.",
            limitation="A healthcare professional should review your medical documents directly.",
        ),
        safe_next_steps=[
            "Schedule a consultation with a qualified doctor or healthcare clinic.",
            "Rest comfortably and stay hydrated.",
            "Seek immediate emergency care (112 / 108) if red flags like breathing difficulty develop.",
        ],
        red_flags=GENERAL_RED_FLAGS,
        medicine_guide_eligible=False,
        disclaimer="Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.",
        evaluated_language=language,
        evaluated_age_group=age_group,
        evaluated_duration=duration,
    )

    if not isinstance(raw_data, dict):
        return fallback_response

    try:
        # 1. Validate Urgency
        raw_urgency = str(raw_data.get("urgency", "")).strip().upper()
        if raw_urgency not in ["SELF_CARE", "CONSULT_SOON", "EMERGENCY_NOW"]:
            urgency = UrgencyEnum.CONSULT_SOON
        else:
            urgency = UrgencyEnum(raw_urgency)

        # 2. Validate Headline and Summary
        headline = sanitize_text(str(raw_data.get("headline", "Triage Guidance")).strip())
        summary = sanitize_text(str(raw_data.get("summary", "A safe summary based on your input.")).strip())

        # 3. Validate Possible Concerns (Max 3, strictly non-diagnostic)
        raw_concerns = raw_data.get("possible_concerns", [])
        possible_concerns: List[PossibleConcern] = []

        if urgency != UrgencyEnum.EMERGENCY_NOW and isinstance(raw_concerns, list):
            for item in raw_concerns[:3]:
                if isinstance(item, dict):
                    category_str = sanitize_text(str(item.get("category", "")).strip())
                    if category_str and len(category_str) < 100:
                        # Ensure category reads as a broad concern, not a confirmed disease
                        if not category_str.lower().endswith("concern") and not category_str.lower().endswith("discomfort"):
                            category_str = f"{category_str} concern"
                        possible_concerns.append(
                            PossibleConcern(
                                category=category_str,
                                uncertainty_note="Cannot be confirmed from this information alone.",
                            )
                        )
                elif isinstance(item, str) and item.strip():
                    cat = sanitize_text(item.strip())
                    if not cat.lower().endswith("concern"):
                        cat = f"{cat} concern"
                    possible_concerns.append(
                        PossibleConcern(
                            category=cat,
                            uncertainty_note="Cannot be confirmed from this information alone.",
                        )
                    )

        # 4. Validate Image Context
        img_raw = raw_data.get("image_context", {})
        if isinstance(img_raw, dict) and has_image:
            img_ctx = ImageContext(
                provided=True,
                quality=str(img_raw.get("quality", "usable")),
                observation=sanitize_text(str(img_raw.get("observation", "General visual context reviewed."))),
                limitation=str(img_raw.get("limitation", "Image quality, lighting, and lack of physical examination limit assessment. Never a diagnosis.")),
            )
        else:
            img_ctx = ImageContext(
                provided=False,
                quality="not_provided",
                observation="No image provided for visual review.",
                limitation="Image context cannot replace physical clinical examination or provide a definitive diagnosis.",
            )

        # 5. Validate Document Context
        doc_raw = raw_data.get("document_context", {})
        if isinstance(doc_raw, dict) and has_doc:
            doc_ctx = DocumentContext(
                provided=True,
                summary=sanitize_text(str(doc_raw.get("summary", "Document content reviewed as user-provided context only."))),
                limitation=str(doc_raw.get("limitation", "Medical documents cannot be clinically interpreted online. A clinician must review all reports directly.")),
            )
        else:
            doc_ctx = DocumentContext(
                provided=False,
                summary="No document provided.",
                limitation="Document content is user-provided context only and is not clinically interpreted as a diagnosis.",
            )

        # 6. Validate Safe Next Steps (Sanitize medicine/prescriptions)
        raw_steps = raw_data.get("safe_next_steps", [])
        safe_steps: List[str] = []
        if isinstance(raw_steps, list):
            for step in raw_steps:
                if isinstance(step, str) and step.strip():
                    s = sanitize_text(step.strip())
                    # Check if step contains forbidden prescription / dosage strings
                    has_forbidden = any(pat.search(s) for pat in FORBIDDEN_MEDICINE_PATTERNS)
                    if has_forbidden:
                        s = "Discuss any relief options or medications with a qualified pharmacist or doctor."
                    safe_steps.append(s)

        if not safe_steps:
            safe_steps = [
                "Rest and monitor symptoms closely over the next 24 to 48 hours.",
                "Consult a healthcare professional if symptoms worsen or fail to improve.",
                "Seek immediate emergency care (112 / 108) if red flags develop.",
            ]

        # 7. Red Flags
        raw_red_flags = raw_data.get("red_flags", [])
        red_flags = [str(rf).strip() for rf in raw_red_flags if isinstance(rf, str) and rf.strip()]
        if not red_flags:
            red_flags = GENERAL_RED_FLAGS

        # 8. Medicine Guide Eligibility (Only for SELF_CARE & non-emergency)
        medicine_guide_eligible = (
            urgency == UrgencyEnum.SELF_CARE and
            age_group.lower() == "adult" and
            bool(raw_data.get("medicine_guide_eligible", True))
        )

        return TriageAnalysisResponse(
            urgency=urgency,
            headline=headline,
            summary=summary,
            possible_concerns=possible_concerns,
            image_context=img_ctx,
            document_context=doc_ctx,
            safe_next_steps=safe_steps,
            red_flags=red_flags,
            medicine_guide_eligible=medicine_guide_eligible,
            disclaimer="Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.",
            evaluated_language=language,
            evaluated_age_group=age_group,
            evaluated_duration=duration,
        )

    except Exception as e:
        print(f"[OutputValidation] Error validating output: {e}")
        return fallback_response
