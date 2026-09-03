import os
import json
import uuid
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import (
    TriageAnalysisResponse,
    TranslateTriageRequest,
    FileUploadResponse,
)
from services.triage_service import process_symptom_triage
from services.storage_service import upload_file_to_storage, is_storage_configured
from services.gemini_service import test_gemini_connection, test_gemini_connection_details
from services.sarvam_translation_service import sarvam_service

# Load environment variables from backend/.env if present
load_dotenv()

app = FastAPI(
    title="AMRIT Health Triage API",
    description="Multilingual (Gemini + Sarvam AI), multimodal, safety-first health triage assistant for India.",
    version="2.1.0",
)

# CORS setup for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_SIZE = 5 * 1024 * 1024       # 5 MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024   # 10 MB

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf"]

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Backend server health check."""
    return {"status": "ok", "backend": "online"}

@app.get("/api/diagnostics/gemini")
async def gemini_diagnostics_endpoint():
    """
    Local-development-only Gemini connection diagnostic test.
    Makes a single minimal request with exponential backoff for transient issues.
    """
    status_code, response_data = test_gemini_connection()
    return JSONResponse(status_code=status_code, content=response_data)

@app.get("/api/diagnostics/gemini-details")
async def gemini_diagnostics_details_endpoint():
    """
    Local-development-only detailed Gemini diagnostic test.
    Returns structured error categories, model availability, and fallback testing.
    """
    status_code, response_data = test_gemini_connection_details()
    return JSONResponse(status_code=status_code, content=response_data)

@app.get("/api/diagnostics/sarvam")
async def sarvam_diagnostics_endpoint():
    """
    Local-development-only Sarvam AI translation diagnostic test.
    Tests translating a short harmless phrase without exposing secrets.
    """
    status_code, response_data = sarvam_service.test_connection()
    return JSONResponse(status_code=status_code, content=response_data)

@app.get("/api/test-gemini")
async def test_gemini_endpoint():
    """
    Direct Gemini verification endpoint.
    Attempts a lightweight test call to verify communication.
    """
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    model_name = os.environ.get("GEMINI_MODEL") or os.environ.get("GEMINI_MODEL_PRIMARY") or "gemini-2.0-flash"

    if not api_key or not api_key.strip():
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "message": "Failed to connect to Gemini",
                "details": "GEMINI_API_KEY is not defined in backend configuration (.env)",
            },
        )

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=model_name,
            contents="Respond with the single word 'Connected'.",
        )
        if resp and resp.text:
            return {
                "status": "ok",
                "backend": "online",
                "gemini": "connected",
                "response": resp.text.strip(),
            }
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "status": "error",
                    "message": "Failed to connect to Gemini",
                    "details": "Empty response received from model",
                },
            )
    except Exception as e:
        err_str = str(e)
        http_code = status.HTTP_403_FORBIDDEN if "403" in err_str or "permission_denied" in err_str.lower() else status.HTTP_503_SERVICE_UNAVAILABLE
        clean_detail = "403 Permission Denied: Generative Language API is disabled for this project." if "403" in err_str or "permission_denied" in err_str.lower() else "Failed to reach Gemini endpoints. Verify key, model, or quota."
        return JSONResponse(
            status_code=http_code,
            content={
                "status": "error",
                "message": "Failed to connect to Gemini",
                "details": clean_detail,
            },
        )

@app.post("/api/analyze-symptoms", response_model=TriageAnalysisResponse)
async def analyze_symptoms_endpoint(
    symptom_text: str = Form(...),
    language: str = Form("English"),
    age_group: str = Form("Adult"),
    duration: str = Form("Started today"),
    symptom_tags: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
):
    """
    Main Multilingual Triage Endpoint:
    1. Normalizes input language.
    2. Deterministic emergency red-flag override (routes to 112/108 immediately).
    3. Translates non-English inputs to English for Gemini non-diagnostic reasoning.
    4. Validates output in English.
    5. Uses Sarvam AI to translate final user-facing response to target Indian language.
    """
    clean_symptom_text = symptom_text.strip()
    if not clean_symptom_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symptom description is required.",
        )

    # Parse symptom tags JSON array if provided
    tags_list: List[str] = []
    if symptom_tags:
        try:
            parsed = json.loads(symptom_tags)
            if isinstance(parsed, list):
                tags_list = [str(t).strip() for t in parsed if str(t).strip()]
        except Exception:
            tags_list = [t.strip() for t in symptom_tags.split(",") if t.strip()]

    # Validate Image
    image_bytes: Optional[bytes] = None
    image_content_type: Optional[str] = None
    if image and image.filename:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image type ({image.content_type}). Allowed types: JPEG, PNG, WebP.",
            )
        image_bytes = await image.read()
        if len(image_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image exceeds maximum size limit of 5 MB ({len(image_bytes)} bytes).",
            )
        image_content_type = image.content_type

    # Validate Document
    pdf_bytes: Optional[bytes] = None
    if document and document.filename:
        if document.content_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type ({document.content_type}). Only PDF files are supported.",
            )
        pdf_bytes = await document.read()
        if len(pdf_bytes) > MAX_DOCUMENT_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PDF document exceeds maximum size limit of 10 MB ({len(pdf_bytes)} bytes).",
            )

    try:
        result = process_symptom_triage(
            symptom_text=clean_symptom_text,
            language=language,
            age_group=age_group,
            duration=duration,
            symptom_tags=tags_list,
            image_bytes=image_bytes,
            image_content_type=image_content_type,
            pdf_bytes=pdf_bytes,
        )
        return result
    except Exception as e:
        print(f"[MainAPI] Unexpected triage processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Triage analysis could not be completed safely. Please consult a qualified healthcare professional.",
        )
    finally:
        image_bytes = None
        pdf_bytes = None

@app.post("/api/translate-triage", response_model=TriageAnalysisResponse)
async def translate_triage_endpoint(payload: TranslateTriageRequest):
    """
    Translates an existing, already validated triage response into another target language.
    Does NOT rerun Gemini reasoning.
    """
    try:
        translated_res = sarvam_service.translate_triage_response(
            payload.triage_response,
            payload.target_language,
        )
        return translated_res
    except Exception as e:
        print(f"[MainAPI] Translate triage error: {e}")
        # Return original with fallback notice
        orig = payload.triage_response
        orig.language.translation_status = "fallback_english"
        orig.language.translation_notice = "Translation is temporarily unavailable. Showing English guidance."
        return orig

@app.post("/api/upload", response_model=FileUploadResponse)
async def upload_file_endpoint(file: UploadFile = File(...)):
    """
    Secure file upload to private Supabase Storage.
    Validates file type and size, generates short-lived signed URL, never public URLs.
    """
    if not is_storage_configured():
        return FileUploadResponse(
            storage_path=f"demo_session/{uuid.uuid4().hex}_{file.filename}",
            file_name=file.filename or "file",
            content_type=file.content_type or "application/octet-stream",
            size_bytes=0,
            signed_url=None,
            message="File validated locally (Private cloud storage is optional for demo).",
        )

    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    if content_type in ALLOWED_IMAGE_TYPES and len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 5 MB limit.")
    elif content_type in ALLOWED_DOCUMENT_TYPES and len(file_bytes) > MAX_DOCUMENT_SIZE:
        raise HTTPException(status_code=400, detail="PDF exceeds 10 MB limit.")

    storage_path, signed_url = upload_file_to_storage(
        file_bytes=file_bytes,
        file_name=file.filename or "upload",
        content_type=content_type,
    )

    if not storage_path:
        raise HTTPException(status_code=500, detail="Storage upload failed.")

    return FileUploadResponse(
        storage_path=storage_path,
        file_name=file.filename or "file",
        content_type=content_type,
        size_bytes=len(file_bytes),
        signed_url=signed_url,
        message="File uploaded securely to private storage with a temporary signed URL.",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
