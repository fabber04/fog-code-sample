from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import StreamingResponse, Response, FileResponse, RedirectResponse
import os
import shutil
from datetime import datetime
import httpx
import re
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Podcast, User
from schemas import PodcastCreate, PodcastUpdate, Podcast as PodcastSchema
from utils.auth import get_current_user, get_current_admin_user
from utils.firebase_admin_auth import require_podcast_admin
from file_server import (
    save_file,
    delete_file as delete_storage_file,
    get_mime_type,
    validate_file_extension
)

router = APIRouter()

# File upload configuration
UPLOAD_DIR = "uploads/podcasts"
AUDIO_DIR = "uploads/podcasts/audio"
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".m4a", ".wav", ".ogg", ".aac", ".mp4"}

# Storage mode is configured via env vars in file_server.py (local or r2)

# Ensure upload directories exist (for local fallback)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

def is_valid_file_extension(filename: str, file_type: str = "image") -> bool:
    """Check if file has valid extension."""
    allowed = ALLOWED_AUDIO_EXTENSIONS if file_type == "audio" else ALLOWED_IMAGE_EXTENSIONS
    return any(filename.lower().endswith(ext) for ext in allowed)

@router.get("/", response_model=List[PodcastSchema])
async def get_podcasts(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    type_filter: Optional[str] = None,
    is_live: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all podcasts with optional filtering."""
    query = db.query(Podcast)
    
    if category and category != "all":
        query = query.filter(Podcast.category == category)
    
    if type_filter and type_filter != "all":
        query = query.filter(Podcast.type == type_filter)
    
    if is_live is not None:
        query = query.filter(Podcast.is_live == is_live)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Podcast.title.ilike(search_term)) |
            (Podcast.host.ilike(search_term)) |
            (Podcast.description.ilike(search_term))
        )
    
    # Order by publish date (newest first)
    query = query.order_by(Podcast.publish_date.desc())
    
    try:
        podcasts = query.offset(skip).limit(limit).all()
        return podcasts
    except Exception as e:
        import traceback
        print(f"Error in get_podcasts: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching podcasts: {str(e)}")

@router.get("/{podcast_id}", response_model=PodcastSchema)
async def get_podcast(podcast_id: int, db: Session = Depends(get_db)):
    """Get a specific podcast by ID."""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    # Increment plays count
    podcast.plays += 1
    db.commit()
    
    return podcast

@router.post("/")
async def create_podcast(
    podcast_data: PodcastCreate,
    # Temporarily disabled auth for content upload
    # current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new podcast (admin only)."""
    try:
        # Log the data being created
        print(f"Creating podcast with data: {podcast_data.dict()}")
        
        db_podcast = Podcast(
            **podcast_data.dict(),
            created_by=None  # Temporary: disabled auth, no user required
        )
        
        db.add(db_podcast)
        db.commit()
        db.refresh(db_podcast)
        
        return db_podcast
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error creating podcast: {error_detail}")
        print(f"Traceback: {traceback_str}")
        # Return detailed error in response
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create podcast: {error_detail}. Check server logs for full traceback."
        )

@router.put("/{podcast_id}", response_model=PodcastSchema)
async def update_podcast(
    podcast_id: int,
    podcast_data: PodcastUpdate,
    _admin_uid: str = Depends(require_podcast_admin),
    db: Session = Depends(get_db)
):
    """Update a podcast (admin only)."""
    db_podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not db_podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    update_data = podcast_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_podcast, field, value)
    
    db_podcast.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_podcast)
    
    return db_podcast

@router.delete("/{podcast_id}")
async def delete_podcast(
    podcast_id: int,
    _admin_uid: str = Depends(require_podcast_admin),
    db: Session = Depends(get_db)
):
    """Delete a podcast (admin only)."""
    db_podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not db_podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    # Delete associated files from storage
    if db_podcast.cover:
        try:
            # Try Python file server first
            if db_podcast.cover.startswith("/storage/"):
                delete_storage_file(db_podcast.cover)
            # Legacy local file
            else:
                file_path = os.path.join(UPLOAD_DIR, db_podcast.cover)
                if os.path.exists(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"Error deleting cover file: {e}")
    
    if db_podcast.audio_url:
        try:
            # Try Python file server first
            if db_podcast.audio_url.startswith("/storage/"):
                delete_storage_file(db_podcast.audio_url)
            # Legacy local file
            elif db_podcast.audio_url.startswith("/uploads/"):
                file_path = db_podcast.audio_url.lstrip("/")
                if os.path.exists(file_path):
                    os.remove(file_path)
        except Exception as e:
            print(f"Error deleting audio file: {e}")
    
    db.delete(db_podcast)
    db.commit()
    
    return {"message": "Podcast deleted successfully"}

@router.post("/upload-cover")
async def upload_podcast_cover(
    file: UploadFile = File(...)
    # Temporarily disabled auth for content upload
    # current_user: User = Depends(get_current_admin_user),
):
    """Upload a cover image for podcasts (admin only)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not is_valid_file_extension(file.filename, "image"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Use Python file server (local storage)
    file_path, public_url = save_file(
        file_content=file_content,
        original_filename=file.filename,
        category="podcasts",
        subcategory="covers",
        file_type="image",
        preserve_filename=True
    )
    
    if file_path and public_url:
        return {"filename": file.filename, "url": public_url}
    
    # Legacy local storage fallback
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"podcast_cover_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    return {"filename": filename, "url": f"/uploads/podcasts/{filename}"}

@router.post("/upload-audio")
async def upload_podcast_audio(
    file: UploadFile = File(...)
    # Temporarily disabled auth for content upload
    # current_user: User = Depends(get_current_admin_user),
):
    """Upload an audio file for podcasts (admin only)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not is_valid_file_extension(file.filename, "audio"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio file type. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Use Python file server (local storage)
    file_path, public_url = save_file(
        file_content=file_content,
        original_filename=file.filename,
        category="podcasts",
        subcategory="audio",
        file_type="audio",
        preserve_filename=True
    )
    
    if file_path and public_url:
        return {"filename": file.filename, "url": public_url}
    
    # Legacy local storage fallback
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"podcast_audio_{timestamp}{file_extension}"
    file_path = os.path.join(AUDIO_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving audio file: {str(e)}")
    
    return {"filename": filename, "url": f"/uploads/podcasts/audio/{filename}"}

@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get all available podcast categories."""
    categories = db.query(Podcast.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/types/list")
async def get_types(db: Session = Depends(get_db)):
    """Get all available podcast types."""
    types = db.query(Podcast.type).distinct().all()
    return [t[0] for t in types if t[0]]

def extract_drive_file_id(url: str) -> Optional[str]:
    """Extract file ID from Google Drive URL."""
    if not url:
        return None
    
    # Pattern 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    
    # Pattern 2: https://drive.google.com/open?id=FILE_ID
    match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    
    # Pattern 3: Just the file ID
    if re.match(r'^[a-zA-Z0-9_-]+$', url):
        return url
    
    return None

def get_allowed_origin(request: Request) -> str:
    """Get allowed origin for CORS headers, matching CORS middleware configuration."""
    origin = request.headers.get("origin")
    if not origin:
        return "*"
    
    # Get allowed origins from environment (same logic as main.py)
    cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
    default_origins = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://localhost:3002",
        "https://fabber04.github.io",
        "https://familyofgreatness.com",
        "https://www.familyofgreatness.com"
    ]
    allow_origins = default_origins + [origin.strip() for origin in cors_origins if origin.strip()]
    
    # If origin is in allowed list, return it; otherwise return first allowed origin or "*"
    if origin in allow_origins:
        return origin
    
    # For security, if origin not in list, return first allowed origin (or "*" if list is empty)
    # In production, CORS middleware will handle validation, but for streaming we need explicit header
    return origin if allow_origins else "*"

@router.options("/{podcast_id}/stream")
async def stream_podcast_audio_options(
    podcast_id: int,
    request: Request
):
    """Handle preflight OPTIONS request for audio streaming."""
    origin = get_allowed_origin(request)
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "Range, Content-Type, Accept, Authorization",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/{podcast_id}/test-audio")
async def test_podcast_audio(
    podcast_id: int,
    db: Session = Depends(get_db)
):
    """Test endpoint to check audio file info without streaming."""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    if not podcast.audio_url:
        return {"error": "No audio URL", "podcast_id": podcast_id}
    
    # Normalize URL
    audio_url_path = podcast.audio_url
    if "://" in audio_url_path:
        from urllib.parse import urlparse
        parsed = urlparse(audio_url_path)
        audio_url_path = parsed.path
    
    is_local = audio_url_path.startswith("/storage/") or audio_url_path.startswith("/uploads/")
    
    result = {
        "podcast_id": podcast_id,
        "title": podcast.title,
        "audio_url": podcast.audio_url,
        "normalized_path": audio_url_path,
        "is_local_file": is_local,
    }
    
    if is_local:
        if audio_url_path.startswith("/storage/"):
            from file_server import STORAGE_DIR
            relative_path = audio_url_path.replace("/storage/", "")
            file_path = str(STORAGE_DIR / relative_path)
        else:
            file_path = audio_url_path.lstrip("/")
        
        result["file_path"] = file_path
        result["file_exists"] = os.path.exists(file_path)
        
        if os.path.exists(file_path):
            result["file_size"] = os.path.getsize(file_path)
            file_ext = os.path.splitext(file_path)[1].lower()
            result["file_extension"] = file_ext
            media_type_map = {
                ".mp3": "audio/mpeg",
                ".m4a": "audio/mp4",
                ".mp4": "audio/mp4",
                ".wav": "audio/wav",
                ".ogg": "audio/ogg",
                ".aac": "audio/aac"
            }
            result["detected_mime_type"] = media_type_map.get(file_ext, "audio/mpeg")
    
    return result

@router.get("/{podcast_id}/stream")
async def stream_podcast_audio(
    podcast_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Stream podcast audio through backend proxy to prevent direct downloads.
    Supports both local uploaded files and Google Drive links.
    Content is available to users, but downloads are restricted via headers.
    """
    # Get podcast
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        print(f"❌ Stream request: Podcast {podcast_id} not found")
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    if not podcast.audio_url:
        print(f"❌ Stream request: Podcast {podcast_id} has no audio_url")
        raise HTTPException(status_code=404, detail="Audio URL not available")
    
    print(f"🎵 Stream request for podcast {podcast_id}: {podcast.title}")
    print(f"   Audio URL: {podcast.audio_url}")

    raw_audio = podcast.audio_url.strip()
    # Hosted on public CDN / R2 (full URL whose path is not our local /storage or /uploads mount)
    if raw_audio.startswith(("http://", "https://")):
        from urllib.parse import urlparse

        path_only = urlparse(raw_audio).path or ""
        serves_local_mount = path_only.startswith("/storage/") or path_only.startswith("/uploads/")
        if not serves_local_mount and "drive.google.com" not in raw_audio.lower():
            podcast.plays += 1
            db.commit()
            print(f"   Redirecting stream to public URL (e.g. R2/CDN): {raw_audio}")
            return RedirectResponse(url=raw_audio, status_code=307)
    
    # Normalize the audio URL - extract path if it's a full URL
    audio_url_path = podcast.audio_url
    if "://" in audio_url_path:
        # Extract path from full URL (e.g., https://example.com/storage/... -> /storage/...)
        from urllib.parse import urlparse
        parsed = urlparse(audio_url_path)
        audio_url_path = parsed.path
        print(f"   Extracted path from full URL: {audio_url_path}")
    
    # Check if it's a local file (starts with /uploads/ or /storage/)
    # Also handle URLs that might be full URLs but point to our server
    is_local_file = (
        audio_url_path.startswith("/uploads/podcasts/audio/") or 
        audio_url_path.startswith("/storage/podcasts/audio/") or
        audio_url_path.startswith("/uploads/") or
        audio_url_path.startswith("/storage/")
    )
    
    if is_local_file:
        # Serve local file
        if audio_url_path.startswith("/storage/"):
            # New storage location
            from file_server import STORAGE_DIR
            relative_path = audio_url_path.replace("/storage/", "")
            file_path = str(STORAGE_DIR / relative_path)
        else:
            # Legacy uploads location
            file_path = audio_url_path.lstrip("/")
        
        print(f"   Local file path: {file_path}")
        print(f"   File exists: {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            print(f"❌ Audio file not found: {file_path}")
            raise HTTPException(status_code=404, detail=f"Audio file not found on server: {file_path}")
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Determine media type from file extension
        # Use standard MIME types that browsers recognize
        file_ext = os.path.splitext(file_path)[1].lower()
        media_type_map = {
            ".mp3": "audio/mpeg",
            ".m4a": "audio/mp4",  # m4a files use audio/mp4 MIME type
            ".mp4": "audio/mp4",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".aac": "audio/aac"
        }
        media_type = media_type_map.get(file_ext, "audio/mpeg")
        print(f"   Detected file extension: {file_ext}")
        print(f"   Using media type: {media_type}")
        
        # Handle Range requests for audio streaming (required for browser playback)
        range_header = request.headers.get("range")
        
        if range_header:
            # Parse range header (e.g., "bytes=0-1023")
            match = re.match(r"bytes=(\d+)-(\d*)", range_header)
            if match:
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else file_size - 1
                
                # Validate range
                if start >= file_size or end >= file_size or start > end:
                    raise HTTPException(
                        status_code=416,
                        detail="Range Not Satisfiable",
                        headers={"Content-Range": f"bytes */{file_size}"}
                    )
                
                content_length = end - start + 1
                
                async def generate_range():
                    """Stream audio data for range request."""
                    with open(file_path, "rb") as f:
                        f.seek(start)
                        remaining = content_length
                        while remaining > 0:
                            chunk_size = min(8192, remaining)
                            chunk = f.read(chunk_size)
                            if not chunk:
                                break
                            yield chunk
                            remaining -= len(chunk)
                
                # Increment plays count only on first request (start == 0)
                if start == 0:
                    podcast.plays += 1
                    db.commit()
                
                # Get allowed origin for CORS
                origin = get_allowed_origin(request)
                
                headers = {
                    "Content-Type": media_type,  # Explicitly set Content-Type
                    "Content-Range": f"bytes {start}-{end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(content_length),
                    "Content-Disposition": "inline",
                    "Cache-Control": "public, max-age=3600",
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                    "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
                    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
                }
                print(f"   Streaming range {start}-{end} of {file_size} bytes with Content-Type: {media_type}")
                return StreamingResponse(
                    generate_range(),
                    status_code=206,  # Partial Content
                    media_type=media_type,
                    headers=headers
                )
        
        # For full file requests, use FileResponse which handles range requests automatically
        # This is more reliable for browser audio playback
        # Increment plays count
        podcast.plays += 1
        db.commit()
        
        # Get allowed origin for CORS
        origin = get_allowed_origin(request)
        
        # Use FileResponse for better browser compatibility
        # FileResponse automatically handles range requests and sets correct headers
        print(f"   Serving file ({file_size} bytes) with Content-Type: {media_type}")
        response = FileResponse(
            path=file_path,
            media_type=media_type,
            headers={
                "Content-Disposition": "inline",
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
                "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
            }
        )
        return response
    
    # Otherwise, it's a Google Drive link - proxy it
    print(f"   Treating as Google Drive link")
    file_id = extract_drive_file_id(podcast.audio_url)
    if not file_id:
        print(f"❌ Could not extract file ID from URL: {podcast.audio_url}")
        raise HTTPException(status_code=400, detail=f"Invalid audio URL format: {podcast.audio_url}")
    
    print(f"   Extracted Google Drive file ID: {file_id}")
    
    # Convert to streaming URL
    stream_url = f"https://drive.google.com/uc?export=open&id={file_id}"
    
    # Try to detect file type from the original URL
    # Check if we can infer from the URL
    detected_media_type = None
    original_url_lower = podcast.audio_url.lower()
    
    if ".m4a" in original_url_lower:
        detected_media_type = "audio/mp4"
    elif ".mp3" in original_url_lower:
        detected_media_type = "audio/mpeg"
    elif ".wav" in original_url_lower:
        detected_media_type = "audio/wav"
    elif ".ogg" in original_url_lower:
        detected_media_type = "audio/ogg"
    elif ".aac" in original_url_lower:
        detected_media_type = "audio/aac"
    
    # Increment plays count
    podcast.plays += 1
    db.commit()
    
    async def generate():
        """Stream audio data from Google Drive."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                async with client.stream('GET', stream_url, follow_redirects=True) as response:
                    if response.status_code != 200:
                        raise HTTPException(
                            status_code=response.status_code,
                            detail="Failed to fetch audio from Google Drive"
                        )
                    
                    # Try to get Content-Type from Google Drive response
                    content_type_from_drive = response.headers.get("Content-Type", "")
                    if content_type_from_drive:
                        print(f"   Google Drive Content-Type: {content_type_from_drive}")
                    
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        yield chunk
            except httpx.RequestError as e:
                raise HTTPException(status_code=500, detail=f"Error streaming audio: {str(e)}")
    
    # Determine media type: prefer detected type, then accept header, finally default
    accept_header = request.headers.get("accept", "").lower()
    media_type = None
    
    # First, use detected type from URL if available
    if detected_media_type:
        media_type = detected_media_type
        print(f"   Using detected media type from URL: {media_type}")
    # Then check accept header
    elif "audio/mp4" in accept_header or "audio/m4a" in accept_header:
        media_type = "audio/mp4"
    elif "audio/mp3" in accept_header or "audio/mpeg" in accept_header:
        media_type = "audio/mpeg"
    elif "audio/ogg" in accept_header:
        media_type = "audio/ogg"
    elif "audio/wav" in accept_header:
        media_type = "audio/wav"
    else:
        # Default: assume m4a files are common, use mp4, otherwise mp3
        media_type = "audio/mp4" if ".m4a" in original_url_lower else "audio/mpeg"
    
    print(f"   Final media type for Google Drive: {media_type}")
    
    # Get allowed origin for CORS
    origin = get_allowed_origin(request)
    
    headers = {
        "Content-Type": media_type,  # Explicitly set Content-Type
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
        "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    }
    print(f"   Streaming Google Drive file with Content-Type: {media_type}")
    return StreamingResponse(
        generate(),
        media_type=media_type,
        headers=headers
    )
