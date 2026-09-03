from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class UrgencyEnum(str, Enum):
    SELF_CARE = "SELF_CARE"
    CONSULT_SOON = "CONSULT_SOON"
    EMERGENCY_NOW = "EMERGENCY_NOW"

class PossibleConcern(BaseModel):
    category: str = Field(..., description="Broad, non-diagnostic concern category (e.g. Skin irritation or rash-related concern)")
    uncertainty_note: str = Field(default="Cannot be confirmed from this information alone.", description="Mandatory uncertainty statement")

class ImageContext(BaseModel):
    provided: bool = False
    quality: str = "not_provided"  # "not_provided" | "limited" | "usable"
    observation: str = "No image provided for visual review."
    limitation: str = "Image context cannot replace physical clinical examination or provide a definitive diagnosis."

class DocumentContext(BaseModel):
    provided: bool = False
    summary: str = "No document provided."
    limitation: str = "Document content is user-provided context only and is not clinically interpreted as a diagnosis."

class TriageAnalysisResponse(BaseModel):
    urgency: UrgencyEnum
    headline: str
    summary: str
    possible_concerns: List[PossibleConcern] = Field(default_factory=list, max_length=3)
    image_context: ImageContext = Field(default_factory=ImageContext)
    document_context: DocumentContext = Field(default_factory=DocumentContext)
    safe_next_steps: List[str] = Field(default_factory=list)
    red_flags: List[str] = Field(default_factory=list)
    medicine_guide_eligible: bool = False
    disclaimer: str = "Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional."
    evaluated_language: str = "English"
    evaluated_age_group: str = "Adult"
    evaluated_duration: str = "Started today"

class FileUploadResponse(BaseModel):
    storage_path: str
    file_name: str
    content_type: str
    size_bytes: int
    signed_url: Optional[str] = None
    message: str = "File uploaded securely to private storage."
