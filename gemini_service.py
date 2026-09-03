import os
import json
import google.generativeai as genai
from models import UrgencyEnum, TriageRequest
from dotenv import load_dotenv

load_dotenv()

def get_gemini_triage(req: TriageRequest, has_red_flags: bool):
    """
    Calls Gemini to generate the triage response.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[GeminiService] GEMINI_API_KEY not found in environment. Using fallback rule-based triage.")
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=(
                "You are AMRIT, a strictly non-diagnostic medical triage assistant for India. "
                "Your ONLY job is to classify symptoms into 'CONSULT_SOON' or 'SELF_CARE' or 'EMERGENCY_NOW' and provide safe, supportive home care guidance. "
                "RULES: \n"
                "1. NEVER diagnose a condition (e.g. NEVER say 'You have eczema').\n"
                "2. NEVER prescribe medications or antibiotics.\n"
                "3. Output MUST be valid JSON matching the schema provided.\n"
                "4. Output MUST be strictly in the language requested by the user."
            ),
            generation_config={
                "response_mime_type": "application/json",
            }
        )

        prompt = f"""
        Evaluate the following patient information:
        - Symptoms: {req.symptoms_text}
        - Selected Tags: {", ".join(req.selected_chips)}
        - Duration: {req.duration.value}
        - Age Group: {req.age_group.value}
        - Photo Attached: {"Yes" if (req.photo_base64 or req.photo_url) else "No"}
        - Requested Language: {req.language.value}

        Red flags detected by rule engine: {"YES" if has_red_flags else "NO"}
        
        If red flags are YES, the urgency MUST be EMERGENCY_NOW.
        If duration is >1 day or photo is attached or age is child/older_adult, default to CONSULT_SOON.
        Otherwise, SELF_CARE.

        Generate the response in JSON format exactly matching this schema:
        {{
            "urgency": "SELF_CARE | CONSULT_SOON | EMERGENCY_NOW",
            "title": "Short title in English",
            "subtitle": "Short subtitle in English",
            "why_explanation": "A safe explanation without diagnosing",
            "safe_next_steps": ["Step 1", "Step 2", "Step 3"],
            "native_heading": "The title translated to the requested language",
            "native_text": "The why_explanation and safe steps summarized in the requested language"
        }}
        """
        
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"[GeminiService] Gemini API call error: {e}")
        return None
