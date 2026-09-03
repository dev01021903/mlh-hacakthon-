import os
import uuid
from typing import Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Optional Supabase client initialization
supabase_client = None

def get_supabase_client():
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if url and key and url.strip() and key.strip():
        try:
            from supabase import create_client
            supabase_client = create_client(url, key)
            return supabase_client
        except Exception as e:
            print(f"[StorageService] Failed to initialize Supabase client: {e}")
            return None
    return None

def is_storage_configured() -> bool:
    return get_supabase_client() is not None

def upload_file_to_storage(
    file_bytes: bytes,
    file_name: str,
    content_type: str,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Securely uploads a file to private Supabase Storage with a UUID path.
    Returns (storage_path, signed_url_with_short_expiry) or (None, None).
    NEVER returns a public URL.
    """
    client = get_supabase_client()
    if not client:
        return None, None

    bucket_name = os.environ.get("SUPABASE_BUCKET", "amrit-health-files")
    file_ext = os.path.splitext(file_name)[1]
    storage_path = f"triage_uploads/{uuid.uuid4().hex}{file_ext}"

    try:
        # Upload to private bucket
        client.storage.from_(bucket_name).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "false"},
        )

        # Generate short-lived signed URL (e.g., valid for 10 minutes only)
        signed_res = client.storage.from_(bucket_name).create_signed_url(
            path=storage_path,
            expires_in=600,
        )

        signed_url = signed_res.get("signedURL") if isinstance(signed_res, dict) else getattr(signed_res, "signed_url", None)
        return storage_path, signed_url
    except Exception as e:
        print(f"[StorageService] Error uploading file to Supabase: {e}")
        return None, None
