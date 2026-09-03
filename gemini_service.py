import os
import json
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
from models import UrgencyEnum, TriageRequest
from dotenv import load_dotenv

load_dotenv()

# Ensure GEMINI_API_KEY is set in your environment variables
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use the latest fast model
model = genai.GenerativeModel(
    "gemini-1.5-flash",
    system_instruction=(
        "You are AMRIT, a strictly non-diagnostic medical triage assistant for India. "
        "Your ONLY job is to classify symptoms into 'CONSULT_SOON' or 'SELF_CARE' and provide safe, supportive home care guidance. "
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

def get_gemini_triage(req: TriageRequest, has_red_flags: bool):
    """
    Calls Gemini to generate the triage response.
    """
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
    try:
        return json.loads(response.text)
    except Exception as e:
        # Fallback in case of parsing error
        print(f"Failed to parse Gemini response: {e}")
        return None
