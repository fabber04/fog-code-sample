from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Announcement, User
from schemas import AnnouncementCreate, AnnouncementUpdate, Announcement as AnnouncementSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[AnnouncementSchema])
async def get_announcements(
    skip: int = 0,
    limit: int = 100,
    priority: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all announcements with optional filtering."""
    query = db.query(Announcement)
    
    if priority and priority != "all":
        query = query.filter(Announcement.priority == priority)
    
    if is_active is not None:
        query = query.filter(Announcement.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Announcement.title.ilike(search_term)) |
            (Announcement.content.ilike(search_term))
        )
    
    # Filter out expired announcements
    now = datetime.utcnow()
    query = query.filter(
        (Announcement.expires_at.is_(None)) | (Announcement.expires_at > now)
    )
    
    # Order by priority (high first) then date (newest first)
    from sqlalchemy import case
    priority_order = case(
        (Announcement.priority == "high", 1),
        (Announcement.priority == "medium", 2),
        (Announcement.priority == "low", 3),
        else_=4
    )
    query = query.order_by(priority_order, Announcement.date.desc())
    
    announcements = query.offset(skip).limit(limit).all()
    return announcements

@router.get("/active", response_model=List[AnnouncementSchema])
async def get_active_announcements(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get active announcements (for dashboard)."""
    now = datetime.utcnow()
    announcements = db.query(Announcement).filter(
        Announcement.is_active == True,
        (Announcement.expires_at.is_(None)) | (Announcement.expires_at > now)
    ).order_by(
        case(
            (Announcement.priority == "high", 1),
            (Announcement.priority == "medium", 2),
            (Announcement.priority == "low", 3),
            else_=4
        ),
        Announcement.date.desc()
    ).limit(limit).all()
    
    return announcements

@router.get("/{announcement_id}", response_model=AnnouncementSchema)
async def get_announcement(announcement_id: int, db: Session = Depends(get_db)):
    """Get a specific announcement by ID."""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

@router.post("/", response_model=AnnouncementSchema)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new announcement (admin only)."""
    db_announcement = Announcement(
        **announcement_data.dict(),
        created_by=current_user.id
    )
    
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement

@router.put("/{announcement_id}", response_model=AnnouncementSchema)
async def update_announcement(
    announcement_id: int,
    announcement_data: AnnouncementUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an announcement (admin only)."""
    db_announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    update_data = announcement_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_announcement, field, value)
    
    db_announcement.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement

@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an announcement (admin only)."""
    db_announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(db_announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}
