"""
Central language configuration for AMRIT.
Maps standard names, UI codes, and native script aliases to Sarvam AI language codes.
"""

from typing import Dict, Tuple

# Sarvam language code mapping
# English -> en-IN
# Hindi -> hi-IN
# Kannada -> kn-IN
# Telugu -> te-IN
# Tamil -> ta-IN

SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en-IN": {
        "display_name": "English",
        "native_name": "English",
        "ui_code": "en",
        "sarvam_code": "en-IN",
    },
    "hi-IN": {
        "display_name": "Hindi",
        "native_name": "हिन्दी",
        "ui_code": "hi",
        "sarvam_code": "hi-IN",
    },
    "kn-IN": {
        "display_name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "ui_code": "kn",
        "sarvam_code": "kn-IN",
    },
    "te-IN": {
        "display_name": "Telugu",
        "native_name": "తెలుగు",
        "ui_code": "te",
        "sarvam_code": "te-IN",
    },
    "ta-IN": {
        "display_name": "Tamil",
        "native_name": "தமிழ்",
        "ui_code": "ta",
        "sarvam_code": "ta-IN",
    },
}

DEFAULT_LANGUAGE_CODE = "en-IN"

# Input aliases for robust normalization
LANGUAGE_ALIASES: Dict[str, str] = {
    # English
    "english": "en-IN",
    "en": "en-IN",
    "en-in": "en-IN",
    "eng": "en-IN",
    
    # Hindi
    "hindi": "hi-IN",
    "हिन्दी": "hi-IN",
    "हिंदी": "hi-IN",
    "hi": "hi-IN",
    "hi-in": "hi-IN",
    "hin": "hi-IN",
    
    # Kannada
    "kannada": "kn-IN",
    "ಕನ್ನಡ": "kn-IN",
    "kn": "kn-IN",
    "kn-in": "kn-IN",
    "kan": "kn-IN",
    
    # Telugu
    "telugu": "te-IN",
    "తెలుగు": "te-IN",
    "te": "te-IN",
    "te-in": "te-IN",
    "tel": "te-IN",
    
    # Tamil
    "tamil": "ta-IN",
    "தமிழ்": "ta-IN",
    "ta": "ta-IN",
    "ta-in": "ta-IN",
    "tam": "ta-IN",
}

def normalize_language(language_input: str) -> Tuple[str, str]:
    """
    Normalizes any language string or code into (display_name, sarvam_code).
    Defaults to ('English', 'en-IN') if unrecognized.
    """
    if not language_input or not str(language_input).strip():
        return "English", DEFAULT_LANGUAGE_CODE

    cleaned = str(language_input).strip().lower()
    sarvam_code = LANGUAGE_ALIASES.get(cleaned, DEFAULT_LANGUAGE_CODE)
    info = SUPPORTED_LANGUAGES.get(sarvam_code, SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE_CODE])
    return info["display_name"], sarvam_code

def get_sarvam_code(language_input: str) -> str:
    _, code = normalize_language(language_input)
    return code

def get_language_display_name(language_input: str) -> str:
    name, _ = normalize_language(language_input)
    return name
