"""
Sarvam AI Translation Service for AMRIT.
Handles translation between English and Indian languages (Hindi, Kannada, Telugu, Tamil).
Used exclusively for display text localization and translating non-English user inputs to English for Gemini reasoning.
"""

import os
import httpx
from typing import Optional, List, Dict, Any, Tuple
from dotenv import load_dotenv

from config.languages import (
    normalize_language,
    get_sarvam_code,
    get_language_display_name,
)
from models.schemas import (
    TriageAnalysisResponse,
    LanguageMetadata,
    PossibleConcern,
    ImageContext,
    DocumentContext,
)

load_dotenv()

SARVAM_TRANSLATE_URL = "https://api.sarvam.ai/translate"

class SarvamTranslationService:
    def __init__(self):
        load_dotenv(override=True)
        self.api_key = os.environ.get("SARVAM_API_KEY", "").strip()
        self.model = os.environ.get("SARVAM_TRANSLATION_MODEL", "sarvam-translate:v1")

    def is_configured(self) -> bool:
        load_dotenv(override=True)
        self.api_key = os.environ.get("SARVAM_API_KEY", "").strip()
        return bool(self.api_key)

    def normalize_language(self, language: str) -> Tuple[str, str]:
        return normalize_language(language)

    def translate_text(
        self,
        text: str,
        source_language: str = "en-IN",
        target_language: str = "hi-IN",
    ) -> Optional[str]:
        """
        Translates a single string between Indian languages / English via Sarvam AI.
        Returns translated string or None on failure.
        """
        if not text or not text.strip():
            return text

        # If source and target are the same, return unchanged
        source_code = get_sarvam_code(source_language)
        target_code = get_sarvam_code(target_language)

        if source_code == target_code:
            return text

        if not self.is_configured():
            return None

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "input": text.strip(),
            "source_language_code": source_code,
            "target_language_code": target_code,
            "model": self.model,
            "mode": "formal",
        }

        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.post(SARVAM_TRANSLATE_URL, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    translated = data.get("translated_text", "")
                    if translated:
                        # Safety guarantee: ensure emergency numbers 112 / 108 are intact
                        if "112" in text and "112" not in translated:
                            translated = f"{translated} (112 / 108)"
                        return translated
                else:
                    print(f"[SarvamService] Translation failed with status {res.status_code}: {res.text[:150]}")
                    return None
        except Exception as e:
            print(f"[SarvamService] Error calling Sarvam translate endpoint: {e}")
            return None

        return None

    def translate_many(
        self,
        texts: List[str],
        source_language: str = "en-IN",
        target_language: str = "hi-IN",
    ) -> List[str]:
        """
        Translates a list of strings sequentially or batched, preserving ordering.
        """
        if not texts:
            return []

        source_code = get_sarvam_code(source_language)
        target_code = get_sarvam_code(target_language)

        if source_code == target_code:
            return texts

        translated_list: List[str] = []
        for t in texts:
            translated = self.translate_text(t, source_language=source_code, target_language=target_code)
            translated_list.append(translated if translated else t)
        return translated_list

    def translate_triage_response(
        self,
        response: TriageAnalysisResponse,
        target_language_input: str,
    ) -> TriageAnalysisResponse:
        """
        Translates all user-facing display fields of a validated TriageAnalysisResponse
        into the requested target language using Sarvam AI.
        Preserves internal enums, logic, emergency numbers, and uncertainty notes.
        Falls back to original English if Sarvam is unavailable.
        """
        display_name, target_code = normalize_language(target_language_input)

        # 1. English target -> return original with original_english status
        if target_code == "en-IN":
            response.language = LanguageMetadata(
                requested="English",
                code="en-IN",
                translation_status="original_english",
                translation_notice=None,
            )
            return response

        # 2. Check if Sarvam is configured
        if not self.is_configured():
            response.language = LanguageMetadata(
                requested=display_name,
                code=target_code,
                translation_status="fallback_english",
                translation_notice="Translation is temporarily unavailable. Showing English guidance.",
            )
            return response

        try:
            # Translate headline & summary
            tr_headline = self.translate_text(response.headline, "en-IN", target_code) or response.headline
            tr_summary = self.translate_text(response.summary, "en-IN", target_code) or response.summary

            # Translate possible concerns categories & uncertainty notes
            tr_concerns: List[PossibleConcern] = []
            for c in response.possible_concerns:
                tr_cat = self.translate_text(c.category, "en-IN", target_code) or c.category
                tr_note = self.translate_text(c.uncertainty_note, "en-IN", target_code) or "Cannot be confirmed from this information alone."
                tr_concerns.append(PossibleConcern(category=tr_cat, uncertainty_note=tr_note))

            # Translate safe next steps & red flags
            tr_next_steps = self.translate_many(response.safe_next_steps, "en-IN", target_code)
            tr_red_flags = self.translate_many(response.red_flags, "en-IN", target_code)

            # Translate emergency action
            tr_emergency_action = self.translate_text(response.emergency_action, "en-IN", target_code) or response.emergency_action

            # Translate image context if provided
            tr_img = response.image_context
            if tr_img.provided:
                tr_obs = self.translate_text(tr_img.observation, "en-IN", target_code) or tr_img.observation
                tr_lim = self.translate_text(tr_img.limitation, "en-IN", target_code) or tr_img.limitation
                tr_img = ImageContext(
                    provided=True,
                    quality=tr_img.quality,
                    observation=tr_obs,
                    limitation=tr_lim,
                )

            # Translate document context if provided
            tr_doc = response.document_context
            if tr_doc.provided:
                tr_doc_sum = self.translate_text(tr_doc.summary, "en-IN", target_code) or tr_doc.summary
                tr_doc_lim = self.translate_text(tr_doc.limitation, "en-IN", target_code) or tr_doc.limitation
                tr_doc = DocumentContext(
                    provided=True,
                    summary=tr_doc_sum,
                    limitation=tr_doc_lim,
                )

            # Translate disclaimer
            tr_disclaimer = self.translate_text(response.disclaimer, "en-IN", target_code) or response.disclaimer

            return TriageAnalysisResponse(
                urgency=response.urgency,
                language=LanguageMetadata(
                    requested=display_name,
                    code=target_code,
                    translation_status="translated",
                    translation_notice=None,
                ),
                headline=tr_headline,
                summary=tr_summary,
                possible_concerns=tr_concerns,
                image_context=tr_img,
                document_context=tr_doc,
                safe_next_steps=tr_next_steps,
                red_flags=tr_red_flags,
                emergency_action=tr_emergency_action,
                medicine_guide_eligible=response.medicine_guide_eligible,
                disclaimer=tr_disclaimer,
                evaluated_age_group=response.evaluated_age_group,
                evaluated_duration=response.evaluated_duration,
            )

        except Exception as e:
            print(f"[SarvamService] Translation error during triage response translation: {e}")
            response.language = LanguageMetadata(
                requested=display_name,
                code=target_code,
                translation_status="fallback_english",
                translation_notice="Translation is temporarily unavailable. Showing English guidance.",
            )
            return response

    def test_connection(self) -> Tuple[int, Dict[str, Any]]:
        """
        Diagnostic test for GET /api/diagnostics/sarvam.
        Translates a short harmless phrase without leaking keys or raw stack traces.
        """
        if not self.is_configured():
            return 503, {
                "configured": False,
                "reachable": False,
                "model": self.model,
                "message": "SARVAM_API_KEY is not configured in backend/.env.",
            }

        test_phrase = "Health guidance is available."
        translated = self.translate_text(test_phrase, source_language="en-IN", target_language="hi-IN")

        if translated:
            return 200, {
                "configured": True,
                "reachable": True,
                "model": self.model,
                "message": "Sarvam AI translation service is connected and operational.",
            }

        return 503, {
            "configured": True,
            "reachable": False,
            "model": self.model,
            "message": "Sarvam AI could not be reached. Check SARVAM_API_KEY, network, or subscription status.",
        }

# Global service instance
sarvam_service = SarvamTranslationService()
