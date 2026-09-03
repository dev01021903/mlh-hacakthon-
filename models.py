from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import enum

class LanguageEnum(str, enum.Enum):
    en = "en"
    hi = "hi"
    kn = "kn"
    te = "te"
    ta = "ta"

class AgeGroupEnum(str, enum.Enum):
    child = "child"
    adult = "adult"
    older_adult = "older_adult"

class DurationEnum(str, enum.Enum):
    today = "today"
    one_to_three_days = "1-3_days"
    more_than_three_days = "more_than_3_days"

class UrgencyEnum(str, enum.Enum):
    SELF_CARE = "SELF_CARE"
    CONSULT_SOON = "CONSULT_SOON"
    EMERGENCY_NOW = "EMERGENCY_NOW"

class TriageRequest(BaseModel):
    language: LanguageEnum = LanguageEnum.en
    age_group: AgeGroupEnum = AgeGroupEnum.adult
    duration: DurationEnum = DurationEnum.one_to_three_days
    symptoms_text: str = Field(..., min_length=1, max_length=2000)
    selected_chips: List[str] = []
    photo_base64: Optional[str] = None
    photo_url: Optional[str] = None
    agreed_to_disclaimer: bool = True

class VernacularGuidance(BaseModel):
    language_code: LanguageEnum
    language_name: str
    native_heading: str
    native_text: str

class UserSummary(BaseModel):
    age_group: AgeGroupEnum
    duration: DurationEnum
    symptoms_text: str
    selected_chips: List[str]
    has_photo: bool
    photo_quality: Optional[str] = None
    language: LanguageEnum

class TriageResponse(BaseModel):
    id: str
    urgency: UrgencyEnum
    badge_text: str = "Triage guidance — not a diagnosis"
    title: str
    subtitle: str
    why_explanation: str
    safe_next_steps: List[str]
    emergency_red_flags: List[str]
    user_summary: UserSummary
    vernacular_guidance: VernacularGuidance
    created_at: datetime

class VoiceTranscriptionRequest(BaseModel):
    audio_base64: str
    language_code: LanguageEnum
    audio_format: str

class VoiceTranscriptionResponse(BaseModel):
    transcribed_text: str
    detected_language: str
    confidence: float
    duration_seconds: float

class PhotoCheckRequest(BaseModel):
    image_base64: str

class PhotoCheckResponse(BaseModel):
    is_acceptable: bool
    quality_assessment: str
    blur_score: float
    lighting_score: float
    detected_visual_features: List[str]
    content_safety_passed: bool
    guidance_tip: str

class PdfExportRequest(BaseModel):
    triage_id: str
    include_photo: bool

class PdfExportResponse(BaseModel):
    pdf_url: str
    expires_in_seconds: int
    file_size_bytes: int

class FeedbackRequest(BaseModel):
    triage_id: str
    rating: str
    comments: Optional[str] = None
