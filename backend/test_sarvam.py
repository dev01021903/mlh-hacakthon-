#!/usr/bin/env python3
"""
Unit and Integration Test Suite for Sarvam AI Translation in AMRIT.
Tests language normalization, mock translation flows, emergency safety,
fallback behavior, and secret isolation.
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config.languages import (
    SUPPORTED_LANGUAGES,
    LANGUAGE_ALIASES,
    normalize_language,
    get_sarvam_code,
)
from models.schemas import (
    UrgencyEnum,
    TriageAnalysisResponse,
    PossibleConcern,
    LanguageMetadata,
)
from services.sarvam_translation_service import SarvamTranslationService
from utils.red_flags import check_emergency_red_flags, get_emergency_response

class TestSarvamTranslationService(unittest.TestCase):

    def setUp(self):
        self.service = SarvamTranslationService()

    # 1. Language Normalization Tests
    def test_language_normalization(self):
        # English
        self.assertEqual(normalize_language("English"), ("English", "en-IN"))
        self.assertEqual(normalize_language("en"), ("English", "en-IN"))
        
        # Hindi
        self.assertEqual(normalize_language("Hindi"), ("Hindi", "hi-IN"))
        self.assertEqual(normalize_language("हिन्दी"), ("Hindi", "hi-IN"))
        self.assertEqual(normalize_language("hi"), ("Hindi", "hi-IN"))

        # Kannada
        self.assertEqual(normalize_language("Kannada"), ("Kannada", "kn-IN"))
        self.assertEqual(normalize_language("ಕನ್ನಡ"), ("Kannada", "kn-IN"))
        self.assertEqual(normalize_language("kn"), ("Kannada", "kn-IN"))

        # Telugu
        self.assertEqual(normalize_language("Telugu"), ("Telugu", "te-IN"))
        self.assertEqual(normalize_language("తెలుగు"), ("Telugu", "te-IN"))
        self.assertEqual(normalize_language("te"), ("Telugu", "te-IN"))

        # Tamil
        self.assertEqual(normalize_language("Tamil"), ("Tamil", "ta-IN"))
        self.assertEqual(normalize_language("தமிழ்"), ("Tamil", "ta-IN"))
        self.assertEqual(normalize_language("ta"), ("Tamil", "ta-IN"))

    # 2. English Output: No Translation Call & original_english Status
    def test_english_output_bypass(self):
        sample_response = TriageAnalysisResponse(
            urgency=UrgencyEnum.CONSULT_SOON,
            headline="Consult a doctor soon",
            summary="Please visit a clinic for evaluation.",
            possible_concerns=[
                PossibleConcern(
                    category="Skin irritation concern",
                    uncertainty_note="Cannot be confirmed from this information alone.",
                )
            ],
            safe_next_steps=["Rest and hydrate."],
            red_flags=["Difficulty breathing"],
        )

        result = self.service.translate_triage_response(sample_response, "English")
        self.assertEqual(result.language.translation_status, "original_english")
        self.assertEqual(result.headline, "Consult a doctor soon")
        self.assertEqual(result.urgency, UrgencyEnum.CONSULT_SOON)

    # 3. Kannada Selected with Mocked Sarvam Translation
    @patch.object(SarvamTranslationService, 'is_configured', return_value=True)
    @patch.object(SarvamTranslationService, 'translate_text')
    @patch.object(SarvamTranslationService, 'translate_many')
    def test_kannada_translation(self, mock_translate_many, mock_translate_text, mock_is_conf):
        # Mock translations
        mock_translate_text.side_effect = lambda text, src, tgt: f"ಕನ್ನಡ: {text}"
        mock_translate_many.side_effect = lambda texts, src, tgt: [f"ಕನ್ನಡ: {t}" for t in texts]

        sample_response = TriageAnalysisResponse(
            urgency=UrgencyEnum.CONSULT_SOON,
            headline="Consult a doctor soon",
            summary="Your symptoms need clinical assessment.",
            possible_concerns=[
                PossibleConcern(
                    category="Skin irritation concern",
                    uncertainty_note="Cannot be confirmed from this information alone.",
                )
            ],
            safe_next_steps=["Visit a primary healthcare center."],
            red_flags=["Heavy bleeding"],
            emergency_action="In an emergency, call 112 or 108 immediately.",
        )

        result = self.service.translate_triage_response(sample_response, "Kannada")

        self.assertEqual(result.language.translation_status, "translated")
        self.assertEqual(result.language.code, "kn-IN")
        self.assertEqual(result.urgency, UrgencyEnum.CONSULT_SOON)
        self.assertTrue(result.headline.startswith("ಕನ್ನಡ:"))
        self.assertEqual(len(result.possible_concerns), 1)
        self.assertTrue("112" in result.emergency_action and "108" in result.emergency_action)

    # 4. Sarvam Unavailable: Fallback to English with Calm Notice
    @patch.object(SarvamTranslationService, 'is_configured', return_value=False)
    def test_sarvam_unavailable_fallback(self, mock_is_conf):
        sample_response = TriageAnalysisResponse(
            urgency=UrgencyEnum.SELF_CARE,
            headline="Self-care and monitor",
            summary="Gentle rest and fluids recommended.",
            possible_concerns=[],
            safe_next_steps=["Rest."],
            red_flags=["Chest pain"],
        )

        result = self.service.translate_triage_response(sample_response, "Telugu")

        self.assertEqual(result.language.translation_status, "fallback_english")
        self.assertEqual(result.language.code, "te-IN")
        self.assertEqual(result.headline, "Self-care and monitor")
        self.assertIn("temporarily unavailable", result.language.translation_notice)

    # 5. Emergency Override Safety: 112 / 108 Preserved Exactly
    def test_emergency_override_preserves_numbers(self):
        em_res = get_emergency_response("English")
        self.assertEqual(em_res.urgency, UrgencyEnum.EMERGENCY_NOW)
        self.assertIn("112", em_res.summary)
        self.assertIn("108", em_res.summary)

    # 6. Security: SARVAM_API_KEY must not be leaked
    def test_security_leak_prevention(self):
        src_path = backend_dir.parent / "src"
        for tsx_file in src_path.rglob("*.ts*"):
            content = tsx_file.read_text()
            self.assertNotIn("VITE_SARVAM_API_KEY", content)
            self.assertNotIn("SARVAM_API_KEY", content)
            self.assertNotIn("api.sarvam.ai", content)

if __name__ == "__main__":
    unittest.main(verbosity=2)
