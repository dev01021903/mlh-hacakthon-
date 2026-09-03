import re
from typing import List
from models.schemas import (
    UrgencyEnum,
    TriageAnalysisResponse,
    ImageContext,
    DocumentContext,
)

RED_FLAG_KEYWORDS = [
    "difficulty breathing",
    "breathing difficulty",
    "shortness of breath",
    "wheezing",
    "gasping",
    "breathless",
    "choking",
    "severe chest pain",
    "chest pain",
    "chest pressure",
    "crushing pain",
    "radiating to arm",
    "radiating to jaw",
    "unconscious",
    "passed out",
    "fainted",
    "collapse",
    "seizure",
    "fits",
    "convulsions",
    "face swelling",
    "facial swelling",
    "lip swelling",
    "tongue swelling",
    "throat swelling",
    "difficulty swallowing",
    "heavy bleeding",
    "bleeding heavily",
    "uncontrolled bleeding",
    "suicidal thoughts",
    "suicide",
    "sudden weakness",
    "sudden paralysis",
    "slurred speech",
    "blue lips",
    "bluish lips",
    "cyanosis",
    "severe allergic reaction",
    "anaphylaxis",
]

GENERAL_RED_FLAGS = [
    "Difficulty breathing, gasping, or severe breathlessness",
    "Facial, lip, tongue, or throat swelling with difficulty swallowing",
    "Crushing or squeezing chest pain, especially radiating to jaw or arm",
    "Heavy, unstoppable bleeding from any site",
    "Active seizures, convulsions, or loss of responsiveness",
    "Sudden weakness, numbness, or slurred speech",
    "Bluish tint on lips, tongue, or fingertips",
]

LOCALIZED_EMERGENCY_HEADLINES = {
    "English": "Emergency care now",
    "Hindi": "आपातकालीन देखभाल - तुरंत 112/108 पर कॉल करें",
    "Kannada": "ತುರ್ತು ಆರೈಕೆ - ತಕ್ಷಣ 112/108 ಕರೆ ಮಾಡಿ",
    "Telugu": "అత్యవసర సంరక్షణ - వెంటనే 112/108 కు కాల్ చేయండి",
    "Tamil": "அவசர சிகிச்சை - உடனடியாக 112/108 ஐ அழைக்கவும்",
    "en": "Emergency care now",
    "hi": "आपातकालीन देखभाल - तुरंत 112/108 पर कॉल करें",
    "kn": "ತುರ್ತು ಆರೈಕೆ - ತಕ್ಷಣ 112/108 ಕರೆ ಮಾಡಿ",
    "te": "అత్యవసర సంరక్షణ - వెంటనే 112/108 కు కాల్ చేయండి",
    "ta": "அவசர சிகிச்சை - உடனடியாக 112/108 ஐ அழைக்கவும்",
}

NEGATION_PATTERNS = [
    r"\bno\s+",
    r"\bnot\s+",
    r"\bwithout\s+",
    r"\bdo\s+not\s+have\s+",
    r"\bdon'?t\s+have\s+",
    r"\bno\s+sign\s+of\s+",
    r"\bdenies\s+",
    r"\bdenying\s+",
    r"\bnever\s+",
]

def check_emergency_red_flags(symptom_text: str, symptom_tags: List[str] = []) -> bool:
    """
    Deterministic red-flag check before any Gemini API call.
    Returns True if an active positive emergency red-flag keyword is present.
    Ignores negated phrases (e.g. 'no breathing difficulty', 'do not have chest pain').
    """
    clean_text = symptom_text.lower()
    
    # 1. Check symptom tags
    for tag in symptom_tags:
        tag_lower = tag.lower()
        if any(keyword in tag_lower for keyword in ["breathing concern", "chest pain", "unconscious", "seizure", "swelling"]):
            return True

    # 2. Check symptom text with negation awareness
    for keyword in RED_FLAG_KEYWORDS:
        if keyword in clean_text:
            pattern = re.compile(rf"(?:{'|'.join(NEGATION_PATTERNS)})[a-z0-9\s,]*{re.escape(keyword)}", re.IGNORECASE)
            if pattern.search(clean_text):
                continue
            return True

    return False

def get_emergency_response(
    language: str = "English",
    age_group: str = "Adult",
    duration: str = "Started today",
    has_image: bool = False,
    has_doc: bool = False,
) -> TriageAnalysisResponse:
    """
    Constructs immediate deterministic emergency response without calling Gemini.
    """
    headline = LOCALIZED_EMERGENCY_HEADLINES.get(language, "Emergency care now")
    summary = (
        "Your symptoms may need urgent medical attention. "
        "Call 112 or 108, or go to the nearest emergency department."
    )

    safe_next_steps = [
        "Call emergency numbers 112 or 108 immediately.",
        "Do not delay emergency care while waiting for online guidance.",
        "Ask someone nearby for help and do not attempt to drive yourself.",
        "Sit in a safe, supported upright position while waiting for emergency responders.",
        "Do not take unprescribed medicines or home remedies during acute red-flag symptoms.",
    ]

    return TriageAnalysisResponse(
        urgency=UrgencyEnum.EMERGENCY_NOW,
        headline=headline,
        summary=summary,
        possible_concerns=[],
        image_context=ImageContext(
            provided=has_image,
            quality="limited" if has_image else "not_provided",
            observation="Visual context deferred in favor of immediate emergency triage.",
            limitation="Emergency red flags require immediate clinical intervention.",
        ),
        document_context=DocumentContext(
            provided=has_doc,
            summary="Document review deferred in favor of immediate emergency triage." if has_doc else "No document provided.",
            limitation="Emergency red flags supersede static document review.",
        ),
        safe_next_steps=safe_next_steps,
        red_flags=GENERAL_RED_FLAGS,
        medicine_guide_eligible=False,
        disclaimer="Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.",
        evaluated_language=language,
        evaluated_age_group=age_group,
        evaluated_duration=duration,
    )
