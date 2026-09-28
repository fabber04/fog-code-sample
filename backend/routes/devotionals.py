from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Devotional, User
from schemas import DevotionalCreate, DevotionalUpdate, Devotional as DevotionalSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[DevotionalSchema])
async def get_devotionals(
    skip: int = 0,
    limit: int = 100,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all devotionals with optional filtering."""
    query = db.query(Devotional)
    
    if featured is not None:
        query = query.filter(Devotional.featured == featured)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Devotional.title.ilike(search_term)) |
            (Devotional.scripture.ilike(search_term)) |
            (Devotional.author.ilike(search_term)) |
            (Devotional.verse.ilike(search_term))
        )
    
    # Order by date (newest first)
    query = query.order_by(Devotional.date.desc())
    
    devotionals = query.offset(skip).limit(limit).all()
    return devotionals

@router.get("/latest", response_model=DevotionalSchema)
async def get_latest_devotional(db: Session = Depends(get_db)):
    """Get the latest devotional."""
    devotional = db.query(Devotional).order_by(Devotional.date.desc()).first()
    if not devotional:
        raise HTTPException(status_code=404, detail="No devotionals found")
    return devotional

@router.get("/{devotional_id}", response_model=DevotionalSchema)
async def get_devotional(devotional_id: int, db: Session = Depends(get_db)):
    """Get a specific devotional by ID."""
    devotional = db.query(Devotional).filter(Devotional.id == devotional_id).first()
    if not devotional:
        raise HTTPException(status_code=404, detail="Devotional not found")
    return devotional

@router.post("/", response_model=DevotionalSchema)
async def create_devotional(
    devotional_data: DevotionalCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new devotional (admin only)."""
    db_devotional = Devotional(
        **devotional_data.dict(),
        created_by=current_user.id
    )
    
    db.add(db_devotional)
    db.commit()
    db.refresh(db_devotional)
    
    return db_devotional

@router.put("/{devotional_id}", response_model=DevotionalSchema)
async def update_devotional(
    devotional_id: int,
    devotional_data: DevotionalUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a devotional (admin only)."""
    db_devotional = db.query(Devotional).filter(Devotional.id == devotional_id).first()
    if not db_devotional:
        raise HTTPException(status_code=404, detail="Devotional not found")
    
    update_data = devotional_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_devotional, field, value)
    
    db_devotional.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_devotional)
    
    return db_devotional

@router.delete("/{devotional_id}")
async def delete_devotional(
    devotional_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a devotional (admin only)."""
    db_devotional = db.query(Devotional).filter(Devotional.id == devotional_id).first()
    if not db_devotional:
        raise HTTPException(status_code=404, detail="Devotional not found")
    
    db.delete(db_devotional)
    db.commit()
    
    return {"message": "Devotional deleted successfully"}
