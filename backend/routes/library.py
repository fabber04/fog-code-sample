from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from database import get_db
from models import LibraryItem, User
from schemas import LibraryItemCreate, LibraryItemUpdate, LibraryItem as LibraryItemSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

# File upload configuration
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".txt"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_valid_file_extension(filename: str) -> bool:
    """Check if file has valid extension."""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

@router.get("/", response_model=List[LibraryItemSchema])
async def get_library_items(
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all library items with optional filtering."""
    query = db.query(LibraryItem)
    
    if type_filter and type_filter != "all":
        query = query.filter(LibraryItem.type == type_filter)
    
    if category_filter and category_filter != "all":
        query = query.filter(LibraryItem.category == category_filter)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (LibraryItem.title.ilike(search_term)) |
            (LibraryItem.author.ilike(search_term)) |
            (LibraryItem.description.ilike(search_term))
        )
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=LibraryItemSchema)
async def get_library_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific library item by ID."""
    item = db.query(LibraryItem).filter(LibraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Library item not found")
    
    # Increment view count
    item.views += 1
    db.commit()
    
    return item

@router.post("/", response_model=LibraryItemSchema)
async def create_library_item(
    item_data: LibraryItemCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new library item (admin only)."""
    db_item = LibraryItem(
        **item_data.dict(),
        author_id=current_user.id
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.put("/{item_id}", response_model=LibraryItemSchema)
async def update_library_item(
    item_id: int,
    item_data: LibraryItemUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a library item (admin only)."""
    db_item = db.query(LibraryItem).filter(LibraryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Library item not found")
    
    # Update only provided fields
    update_data = item_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.delete("/{item_id}")
async def delete_library_item(
    item_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a library item (admin only)."""
    db_item = db.query(LibraryItem).filter(LibraryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Library item not found")
    
    # Delete associated file if exists
    if db_item.cover_image:
        try:
            file_path = os.path.join(UPLOAD_DIR, db_item.cover_image)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    db.delete(db_item)
    db.commit()
    
    return {"message": "Library item deleted successfully"}

@router.post("/upload-cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a cover image for library items (admin only)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not is_valid_file_extension(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"cover_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    return {"filename": filename, "url": f"/uploads/{filename}"}

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all available categories."""
    categories = db.query(LibraryItem.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/types")
async def get_types(db: Session = Depends(get_db)):
    """Get all available types."""
    types = db.query(LibraryItem.type).distinct().all()
    return [t[0] for t in types if t[0]]

@router.post("/{item_id}/download")
async def download_library_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a download for a library item."""
    db_item = db.query(LibraryItem).filter(LibraryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Library item not found")
    
    # Increment download count
    db_item.downloads += 1
    db.commit()
    
    return {"message": "Download recorded successfully"}

