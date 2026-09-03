from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime

from models import (
    TriageRequest, TriageResponse, UrgencyEnum, UserSummary, VernacularGuidance,
    VoiceTranscriptionRequest, VoiceTranscriptionResponse,
    PhotoCheckRequest, PhotoCheckResponse,
    PdfExportRequest, PdfExportResponse,
    FeedbackRequest
)

app = FastAPI(title="AMRIT Triage Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RED_FLAGS = [
    "difficulty breathing", "shortness of breath", "wheezing", "gasping", "breathless", "choking", "blue lips", "cyanosis",
    "chest pain", "chest pressure", "crushing pain", "radiating to arm", "radiating to jaw",
    "unconscious", "passed out", "fainted", "collapse", "seizure", "fits", "convulsions", "sudden paralysis", "slurred speech",
    "facial swelling", "lip swelling", "tongue swelling", "throat swelling", "difficulty swallowing",
    "heavy bleeding", "uncontrolled bleeding", "severe deep burn",
    "suicide", "suicidal thoughts", "poisoning"
]

YELLOW_FLAGS = [
    "rash", "wound", "cut", "swelling", "eye redness", "burn", "infection", "blisters",
    "fever", "persistent cough", "vomiting", "severe headache", "stomach pain"
]

VERNACULAR_MAP = {
    "en": {
        "name": "English",
        "EMERGENCY_NOW": {"heading": "EMERGENCY - SEEK IMMEDIATE CARE", "text": "Seek emergency care immediately. Call 112 or 108."},
        "CONSULT_SOON": {"heading": "MEDICAL CONSULTATION RECOMMENDED", "text": "Consult a doctor or visit a nearby clinic within 24-48 hours."},
        "SELF_CARE": {"heading": "SELF-CARE & MONITORING", "text": "Rest, stay hydrated, and monitor your symptoms. If they worsen, consult a doctor."}
    },
    "hi": {
        "name": "Hindi",
        "EMERGENCY_NOW": {"heading": "आपातकाल - तुरंत चिकित्सा लें", "text": "तुरंत आपातकालीन चिकित्सा लें। 112 या 108 पर कॉल करें।"},
        "CONSULT_SOON": {"heading": "चिकित्सकीय परामर्श की सलाह", "text": "24-48 घंटों के भीतर किसी डॉक्टर से परामर्श लें या नजदीकी क्लिनिक जाएं।"},
        "SELF_CARE": {"heading": "स्वयं देखभाल और निगरानी", "text": "आराम करें, हाइड्रेटेड रहें और अपने लक्षणों की निगरानी करें। यदि वे बिगड़ते हैं, तो डॉक्टर से परामर्श लें।"}
    },
    "kn": {
        "name": "Kannada",
        "EMERGENCY_NOW": {"heading": "ತುರ್ತು - ತಕ್ಷಣದ ಆರೈಕೆ ಪಡೆಯಿರಿ", "text": "ತಕ್ಷಣ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ. 112 ಅಥವಾ 108 ಗೆ ಕರೆ ಮಾಡಿ."},
        "CONSULT_SOON": {"heading": "ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ", "text": "24-48 ಗಂಟೆಗಳ ಒಳಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಹತ್ತಿರದ ಕ್ಲಿನಿಕ್ ಭೇಟಿ ನೀಡಿ."},
        "SELF_CARE": {"heading": "ಸ್ವಯಂ ಆರೈಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆ", "text": "ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಹೈಡ್ರೇಟೆಡ್ ಆಗಿರಿ ಮತ್ತು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ. ಅವು ಉಲ್ಬಣಗೊಂಡರೆ, ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ."}
    },
    "te": {
        "name": "Telugu",
        "EMERGENCY_NOW": {"heading": "అత్యవసరం - వెంటనే వైద్య సహాయం పొందండి", "text": "వెంటనే అత్యవసర వైద్య సహాయం పొందండి. 112 లేదా 108 కు కాల్ చేయండి."},
        "CONSULT_SOON": {"heading": "వైద్య సంప్రదింపులు సిఫార్సు చేయబడ్డాయి", "text": "24-48 గంటల్లో డాక్టర్‌ని సంప్రదించండి లేదా సమీపంలోని క్లినిక్‌ని సందర్శించండి."},
        "SELF_CARE": {"heading": "స్వీయ సంరక్షణ & పర్యవేక్షణ", "text": "విశ్రాంతి తీసుకోండి, హైడ్రేటెడ్‌గా ఉండండి మరియు మీ లక్షణాలను గమనించండి. అవి తీవ్రమైతే, డాక్టర్‌ని సంప్రదించండి."}
    },
    "ta": {
        "name": "Tamil",
        "EMERGENCY_NOW": {"heading": "அவசரம் - உடனடியாக மருத்துவ உதவியை நாடுங்கள்", "text": "உடனடியாக அவசர மருத்துவ உதவியை நாடுங்கள். 112 அல்லது 108 ஐ அழைக்கவும்."},
        "CONSULT_SOON": {"heading": "மருத்துவ ஆலோசனை பரிந்துரைக்கப்படுகிறது", "text": "24-48 மணி நேரத்திற்குள் மருத்துவரை அணுகவும் அல்லது அருகிலுள்ள கிளினிக்கிற்கு செல்லவும்."},
        "SELF_CARE": {"heading": "சுய பராமரிப்பு மற்றும் கண்காணிப்பு", "text": "ஓய்வெடுக்கவும், நீர்ச்சத்துடன் இருக்கவும், உங்கள் அறிகுறிகளைக் கண்காணிக்கவும். அவை மோசமடைந்தால், மருத்துவரை அணுகவும்."}
    }
}

def evaluate_rules(req: TriageRequest) -> UrgencyEnum:
    combined_text = (req.symptoms_text + " " + " ".join(req.selected_chips)).lower()
    
    # Level 1: EMERGENCY_NOW
    for flag in RED_FLAGS:
        if flag in combined_text:
            return UrgencyEnum.EMERGENCY_NOW
            
    # Level 2: CONSULT_SOON
    if req.duration.value in ["1-3_days", "more_than_3_days"]:
        return UrgencyEnum.CONSULT_SOON
        
    if req.photo_base64 or req.photo_url:
        return UrgencyEnum.CONSULT_SOON
        
    for flag in YELLOW_FLAGS:
        if flag in combined_text:
            return UrgencyEnum.CONSULT_SOON
            
    if req.age_group.value in ["child", "older_adult"]:
        return UrgencyEnum.CONSULT_SOON
        
    # Level 3: SELF_CARE
    return UrgencyEnum.SELF_CARE

from gemini_service import get_gemini_triage

@app.post("/api/v1/triage/evaluate", response_model=TriageResponse)
async def evaluate_triage(req: TriageRequest):
    if not req.agreed_to_disclaimer:
        raise HTTPException(status_code=400, detail="Disclaimer agreement required.")
        
    # 1. Rule Engine checks for Emergency Red Flags
    rule_urgency = evaluate_rules(req)
    has_red_flags = (rule_urgency == UrgencyEnum.EMERGENCY_NOW)
    
    # 2. Send safe prompt to Gemini
    gemini_data = None
    try:
        gemini_data = get_gemini_triage(req, has_red_flags)
    except Exception as e:
        print(f"Gemini API error: {e}")
        
    # 3. Fallback to Rule Engine if Gemini fails
    if not gemini_data:
        urgency = rule_urgency
        lang_info = VERNACULAR_MAP.get(req.language.value, VERNACULAR_MAP["en"])
        gemini_data = {
            "urgency": urgency.value,
            "title": "CONSULT A DOCTOR" if urgency != UrgencyEnum.SELF_CARE else "SELF-CARE",
            "subtitle": "Please review your symptoms with a professional.",
            "why_explanation": "Our system detected symptoms that require review.",
            "safe_next_steps": ["Rest", "Consult a doctor if symptoms persist"],
            "native_heading": lang_info[urgency.value]["heading"],
            "native_text": lang_info[urgency.value]["text"]
        }
    
    # Parse urgency safely
    urgency_val = gemini_data.get("urgency", "CONSULT_SOON")
    try:
        urgency_enum = UrgencyEnum(urgency_val)
    except ValueError:
        urgency_enum = UrgencyEnum.CONSULT_SOON
        
    # 4. Construct Final Response
    emergency_red_flags = [
        "Difficulty breathing or wheezing",
        "Sudden facial, lip, or throat swelling",
        "High fever (>102°F / 38.9°C) with severe chills or confusion",
        "Rapidly spreading rash with peeling skin or blisters",
        "Extreme dizziness, fainting, or inability to stay awake"
    ]
    
    lang_info = VERNACULAR_MAP.get(req.language.value, VERNACULAR_MAP["en"])
    
    return TriageResponse(
        id=f"amrit_tri_{uuid.uuid4().hex[:8]}",
        urgency=urgency_enum,
        badge_text="Triage guidance — not a diagnosis",
        title=gemini_data.get("title", "Triage Assessment"),
        subtitle=gemini_data.get("subtitle", ""),
        why_explanation=gemini_data.get("why_explanation", ""),
        safe_next_steps=gemini_data.get("safe_next_steps", []),
        emergency_red_flags=emergency_red_flags,
        user_summary=UserSummary(
            age_group=req.age_group,
            duration=req.duration,
            symptoms_text=req.symptoms_text,
            selected_chips=req.selected_chips,
            has_photo=bool(req.photo_base64 or req.photo_url),
            language=req.language
        ),
        vernacular_guidance=VernacularGuidance(
            language_code=req.language,
            language_name=lang_info["name"],
            native_heading=gemini_data.get("native_heading", lang_info[urgency_enum.value]["heading"]),
            native_text=gemini_data.get("native_text", lang_info[urgency_enum.value]["text"])
        ),
        created_at=datetime.utcnow()
    )

@app.post("/api/v1/speech/transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_speech(req: VoiceTranscriptionRequest):
    # Mock response for ASR
    return VoiceTranscriptionResponse(
        transcribed_text="कल से मेरी बाँह पर लाल चकत्ते हैं और खुजली हो रही है",
        detected_language=req.language_code,
        confidence=0.95,
        duration_seconds=3.2
    )

@app.post("/api/v1/vision/check-photo", response_model=PhotoCheckResponse)
async def check_photo(req: PhotoCheckRequest):
    # Mock response for vision check
    return PhotoCheckResponse(
        is_acceptable=True,
        quality_assessment="good",
        blur_score=0.12,
        lighting_score=0.88,
        detected_visual_features=["erythema", "localized_rash"],
        content_safety_passed=True,
        guidance_tip="Photo has good focus and lighting."
    )

@app.post("/api/v1/triage/export-pdf", response_model=PdfExportResponse)
async def export_pdf(req: PdfExportRequest):
    # Mock response for PDF export
    return PdfExportResponse(
        pdf_url=f"https://api.amrit.health/reports/{req.triage_id}.pdf",
        expires_in_seconds=3600,
        file_size_bytes=142050
    )

@app.post("/api/v1/feedback")
async def submit_feedback(req: FeedbackRequest):
    # Mock response for feedback
    return {"status": "success", "message": "Feedback recorded."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
