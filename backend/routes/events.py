from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from database import get_db
from models import Event, User
from schemas import EventCreate, EventUpdate, Event as EventSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

# File upload configuration
UPLOAD_DIR = "uploads/events"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_valid_file_extension(filename: str) -> bool:
    """Check if file has valid extension."""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

@router.get("/", response_model=List[EventSchema])
async def get_events(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all events with optional filtering."""
    query = db.query(Event)
    
    if category and category != "all":
        query = query.filter(Event.category == category)
    
    if featured is not None:
        query = query.filter(Event.featured == featured)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Event.title.ilike(search_term)) |
            (Event.description.ilike(search_term))
        )
    
    # Order by date (upcoming first)
    query = query.order_by(Event.date.asc())
    
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventSchema)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=EventSchema)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new event (admin only)."""
    db_event = Event(
        **event_data.dict(),
        created_by=current_user.id,
        current_attendees=0
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return db_event

@router.put("/{event_id}", response_model=EventSchema)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an event (admin only)."""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db_event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_event)
    
    return db_event

@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an event (admin only)."""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Delete associated image if exists
    if db_event.image:
        try:
            file_path = os.path.join(UPLOAD_DIR, db_event.image)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    db.delete(db_event)
    db.commit()
    
    return {"message": "Event deleted successfully"}

@router.post("/upload-image")
async def upload_event_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload an image for events (admin only)."""
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
    filename = f"event_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    return {"filename": filename, "url": f"/uploads/events/{filename}"}
