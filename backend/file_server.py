#!/usr/bin/env python3
"""
Python File Server for FOG Platform
Stores and serves podcasts, images, and other media files
"""

import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple
import uuid
from urllib.parse import urlparse

try:
    import boto3  # type: ignore
except Exception:  # pragma: no cover
    boto3 = None

# Base directory for file storage
BASE_STORAGE_DIR = Path(__file__).parent.parent / "storage"
STORAGE_DIR = BASE_STORAGE_DIR / "files"

# Directory structure
DIRECTORIES = {
    "podcasts": {
        "audio": STORAGE_DIR / "podcasts" / "audio",
        "covers": STORAGE_DIR / "podcasts" / "covers",
    },
    "images": {
        "events": STORAGE_DIR / "images" / "events",
        "courses": STORAGE_DIR / "images" / "courses",
        "library": STORAGE_DIR / "images" / "library",
        "general": STORAGE_DIR / "images" / "general",
    },
    "documents": {
        "library": STORAGE_DIR / "documents" / "library",
        "courses": STORAGE_DIR / "documents" / "courses",
    }
}

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    "audio": {".mp3", ".m4a", ".wav", ".ogg", ".aac", ".mp4"},
    "image": {".jpg", ".jpeg", ".png", ".gif", ".webp"},
    "document": {".pdf", ".doc", ".docx", ".txt", ".md"},
}

# MIME types
MIME_TYPES = {
    # Audio
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".aac": "audio/aac",
    ".mp4": "audio/mp4",
    # Images
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    # Documents
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/markdown",
}

def _get_storage_mode() -> str:
    return os.getenv("STORAGE_MODE", "local").strip().lower() or "local"


def _r2_client():
    """
    Create an S3-compatible client for Cloudflare R2.

    Required env vars:
    - R2_ACCESS_KEY_ID
    - R2_SECRET_ACCESS_KEY
    - R2_ENDPOINT_URL (e.g. https://<accountid>.r2.cloudflarestorage.com)
    """
    if boto3 is None:
        raise RuntimeError("boto3 is required for R2 storage. Add boto3 to requirements.txt")

    access_key_id = os.getenv("R2_ACCESS_KEY_ID", "").strip()
    secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY", "").strip()
    endpoint_url = os.getenv("R2_ENDPOINT_URL", "").strip()

    if not access_key_id or not secret_access_key or not endpoint_url:
        raise RuntimeError("Missing R2 credentials/config. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL.")

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
    )


def _r2_bucket() -> str:
    bucket = os.getenv("R2_BUCKET", "").strip()
    if not bucket:
        raise RuntimeError("Missing R2_BUCKET env var.")
    return bucket


def _r2_public_base_url() -> str:
    """
    Base URL used to construct public links for objects.

    Examples:
    - https://media.familyofgreatness.com
    - https://<bucket>.<accountid>.r2.cloudflarestorage.com (if you use that style)
    """
    base = os.getenv("R2_PUBLIC_BASE_URL", "").strip()
    if not base:
        raise RuntimeError("Missing R2_PUBLIC_BASE_URL env var (needed to return playable public URLs).")
    return base.rstrip("/")


def _r2_object_key(category: str, subcategory: str, filename: str) -> str:
    safe_filename = filename.replace("\\", "/").split("/")[-1]
    return f"{category}/{subcategory}/{safe_filename}"


def initialize_storage():
    """Initialize storage directories."""
    print("📁 Initializing file storage directories...")
    
    # Create base storage directory
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create all subdirectories
    for category, subdirs in DIRECTORIES.items():
        for subdir_name, subdir_path in subdirs.items():
            subdir_path.mkdir(parents=True, exist_ok=True)
            print(f"  ✅ Created: {subdir_path}")
    
    print(f"✅ Storage initialized at: {STORAGE_DIR}")
    return True


def get_mime_type(filename: str) -> str:
    """Get MIME type from file extension."""
    ext = Path(filename).suffix.lower()
    return MIME_TYPES.get(ext, "application/octet-stream")


def validate_file_extension(filename: str, file_type: str) -> bool:
    """Validate file extension."""
    ext = Path(filename).suffix.lower()
    allowed = ALLOWED_EXTENSIONS.get(file_type, set())
    return ext in allowed


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename with timestamp and UUID."""
    ext = Path(original_filename).suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    return f"{timestamp}_{unique_id}{ext}"


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage while preserving original name."""
    import re
    # Remove path components
    filename = Path(filename).name
    # Keep original name but sanitize problematic characters
    # Keep alphanumeric, spaces, dots, hyphens, underscores, parentheses
    # URL-encode spaces to %20 for URLs, but keep spaces in filename
    filename = re.sub(r'[<>:"|?*\x00-\x1f]', '', filename)  # Remove truly problematic chars
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    # Ensure filename is not empty
    if not filename:
        filename = "file"
    return filename


def save_file(
    file_content: bytes,
    original_filename: str,
    category: str,
    subcategory: str,
    file_type: str = "image",
    preserve_filename: bool = False
) -> Tuple[Optional[str], Optional[str]]:
    """
    Save a file to storage.
    
    Args:
        file_content: Binary content of the file
        original_filename: Original filename
        category: Category (podcasts, images, documents)
        subcategory: Subcategory (audio, covers, events, etc.)
        file_type: Type of file (audio, image, document)
        preserve_filename: If True, use original filename (sanitized). If False, generate unique name.
    
    Returns:
        Tuple of (file_path, public_url) or (None, None) if failed
    """
    # Validate file extension
    if not validate_file_extension(original_filename, file_type):
        return None, None
    
    # Get target directory
    if category not in DIRECTORIES:
        return None, None
    
    if subcategory not in DIRECTORIES[category]:
        return None, None
    
    target_dir = DIRECTORIES[category][subcategory]
    
    # Choose filename strategy
    if preserve_filename:
        # Use original filename (sanitized)
        filename = sanitize_filename(original_filename)
        file_path = target_dir / filename
        
        # If file exists, add a number suffix
        if file_path.exists():
            base = file_path.stem
            ext = file_path.suffix
            counter = 1
            while file_path.exists():
                file_path = target_dir / f"{base}_{counter}{ext}"
                counter += 1
    else:
        # Generate unique filename
        unique_filename = generate_unique_filename(original_filename)
        file_path = target_dir / unique_filename
    
    # Save file (Cloudflare R2)
    if _get_storage_mode() == "r2":
        try:
            client = _r2_client()
            bucket = _r2_bucket()
            public_base = _r2_public_base_url()

            filename_for_key = file_path.name
            object_key = _r2_object_key(category, subcategory, filename_for_key)

            content_type = get_mime_type(filename_for_key)
            client.put_object(
                Bucket=bucket,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
            )

            public_url = f"{public_base}/{object_key}"
            print(f"✅ File uploaded to R2: s3://{bucket}/{object_key}")
            print(f"   Public URL: {public_url}")

            # We don't store a local file path in R2 mode
            return object_key, public_url
        except Exception as e:
            print(f"❌ Error uploading to R2 (falling back to local): {e}")

    # Save file (local disk)
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Generate public URL (relative to storage base)
        relative_path = file_path.relative_to(STORAGE_DIR)
        public_url = f"/storage/{relative_path.as_posix()}"
        
        print(f"✅ File saved: {file_path}")
        print(f"   Public URL: {public_url}")
        
        return str(file_path), public_url
    
    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None, None


def save_file_from_path(
    source_path: str,
    category: str,
    subcategory: str,
    file_type: str = "image"
) -> Tuple[Optional[str], Optional[str]]:
    """
    Save a file from local path to storage.
    
    Args:
        source_path: Path to source file
        category: Category (podcasts, images, documents)
        subcategory: Subcategory (audio, covers, events, etc.)
        file_type: Type of file (audio, image, document)
    
    Returns:
        Tuple of (file_path, public_url) or (None, None) if failed
    """
    source = Path(source_path)
    if not source.exists():
        print(f"❌ Source file not found: {source_path}")
        return None, None
    
    try:
        with open(source, "rb") as f:
            file_content = f.read()
        
        return save_file(
            file_content,
            source.name,
            category,
            subcategory,
            file_type
        )
    
    except Exception as e:
        print(f"❌ Error reading source file: {e}")
        return None, None


def delete_file(file_url: str) -> bool:
    """
    Delete a file from storage using its URL.
    
    Args:
        file_url: Public URL of the file (e.g., /storage/podcasts/audio/file.m4a)
    
    Returns:
        True if deletion successful, False otherwise
    """
    try:
        # Delete from R2 if enabled
        if _get_storage_mode() == "r2":
            client = _r2_client()
            bucket = _r2_bucket()
            public_base = os.getenv("R2_PUBLIC_BASE_URL", "").strip().rstrip("/")

            key: Optional[str] = None
            if public_base and file_url.startswith(public_base + "/"):
                key = file_url[len(public_base) + 1 :]
            elif file_url.startswith("http://") or file_url.startswith("https://"):
                # Best-effort parse: use path without leading "/"
                parsed = urlparse(file_url)
                key = parsed.path.lstrip("/")
            elif file_url.startswith("/storage/"):
                # Local-style URL; not applicable for R2, fall through
                key = None

            if key:
                client.delete_object(Bucket=bucket, Key=key)
                print(f"✅ R2 object deleted: s3://{bucket}/{key}")
                return True

        # Remove /storage prefix and get file path
        if file_url.startswith("/storage/"):
            relative_path = file_url.replace("/storage/", "")
        else:
            relative_path = file_url
        
        file_path = STORAGE_DIR / relative_path
        
        if file_path.exists():
            file_path.unlink()
            print(f"✅ File deleted: {file_path}")
            return True
        else:
            print(f"⚠️ File not found: {file_path}")
            return False
    
    except Exception as e:
        print(f"❌ Error deleting file: {e}")
        return False


def get_file_path(file_url: str) -> Optional[Path]:
    """
    Get local file path from public URL.
    
    Args:
        file_url: Public URL of the file
    
    Returns:
        Path object or None if not found
    """
    try:
        if file_url.startswith("/storage/"):
            relative_path = file_url.replace("/storage/", "")
        else:
            relative_path = file_url
        
        file_path = STORAGE_DIR / relative_path
        
        if file_path.exists():
            return file_path
        else:
            return None
    
    except Exception as e:
        print(f"❌ Error getting file path: {e}")
        return None


def get_storage_info() -> dict:
    """Get information about storage usage."""
    total_size = 0
    file_count = 0
    
    for root, dirs, files in os.walk(STORAGE_DIR):
        for file in files:
            file_path = Path(root) / file
            total_size += file_path.stat().st_size
            file_count += 1
    
    return {
        "storage_path": str(STORAGE_DIR),
        "total_files": file_count,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "total_size_gb": round(total_size / (1024 * 1024 * 1024), 2),
    }


if __name__ == "__main__":
    # Initialize storage when run directly
    print("🚀 FOG Platform File Server")
    print("=" * 50)
    initialize_storage()
    
    # Show storage info
    info = get_storage_info()
    print("\n📊 Storage Information:")
    print(f"   Location: {info['storage_path']}")
    print(f"   Files: {info['total_files']}")
    print(f"   Size: {info['total_size_mb']} MB ({info['total_size_gb']} GB)")

