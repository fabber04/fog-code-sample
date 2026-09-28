from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import PrayerRequest, User
from schemas import PrayerRequestCreate, PrayerRequestUpdate, PrayerRequest as PrayerRequestSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.post("/", response_model=PrayerRequestSchema)
async def create_prayer_request(
    prayer_data: PrayerRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new prayer request."""
    db_prayer = PrayerRequest(
        **prayer_data.dict(),
        requester_id=current_user.id
    )
    
    db.add(db_prayer)
    db.commit()
    db.refresh(db_prayer)
    
    return db_prayer

@router.get("/", response_model=List[PrayerRequestSchema])
async def get_prayer_requests(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    is_private: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get prayer requests based on user role."""
    if current_user.is_admin:
        # Admins can see all prayer requests
        query = db.query(PrayerRequest)
        
        if status_filter and status_filter != "all":
            query = query.filter(PrayerRequest.status == status_filter)
        
        if is_private is not None:
            query = query.filter(PrayerRequest.is_private == is_private)
    else:
        # Regular users can only see their own prayer requests
        query = db.query(PrayerRequest).filter(PrayerRequest.requester_id == current_user.id)
    
    prayer_requests = query.offset(skip).limit(limit).order_by(PrayerRequest.created_at.desc()).all()
    return prayer_requests

@router.get("/{prayer_id}", response_model=PrayerRequestSchema)
async def get_prayer_request(
    prayer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific prayer request."""
    prayer_request = db.query(PrayerRequest).filter(PrayerRequest.id == prayer_id).first()
    if not prayer_request:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    
    # Check if user has access to this prayer request
    if not current_user.is_admin and prayer_request.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return prayer_request

@router.put("/{prayer_id}", response_model=PrayerRequestSchema)
async def update_prayer_request(
    prayer_id: int,
    prayer_data: PrayerRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a prayer request."""
    prayer_request = db.query(PrayerRequest).filter(PrayerRequest.id == prayer_id).first()
    if not prayer_request:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    
    # Check if user has permission to update this prayer request
    if not current_user.is_admin and prayer_request.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Regular users can only update certain fields
    if not current_user.is_admin:
        allowed_fields = {"title", "description", "is_private"}
        update_data = {k: v for k, v in prayer_data.dict(exclude_unset=True).items() if k in allowed_fields}
    else:
        update_data = prayer_data.dict(exclude_unset=True)
    
    # Update fields
    for field, value in update_data.items():
        setattr(prayer_request, field, value)
    
    prayer_request.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prayer_request)
    
    return prayer_request

@router.delete("/{prayer_id}")
async def delete_prayer_request(
    prayer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a prayer request."""
    prayer_request = db.query(PrayerRequest).filter(PrayerRequest.id == prayer_id).first()
    if not prayer_request:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    
    # Check if user has permission to delete this prayer request
    if not current_user.is_admin and prayer_request.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(prayer_request)
    db.commit()
    
    return {"message": "Prayer request deleted successfully"}

@router.post("/{prayer_id}/status")
async def update_prayer_status(
    prayer_id: int,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update prayer request status (admin only)."""
    valid_statuses = ["pending", "in_progress", "answered"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    prayer_request = db.query(PrayerRequest).filter(PrayerRequest.id == prayer_id).first()
    if not prayer_request:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    
    prayer_request.status = status
    prayer_request.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Prayer request status updated to {status}"}

@router.get("/stats/overview")
async def get_prayer_stats(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Get prayer request statistics (admin only)."""
    total_requests = db.query(PrayerRequest).count()
    pending_requests = db.query(PrayerRequest).filter(PrayerRequest.status == "pending").count()
    in_progress_requests = db.query(PrayerRequest).filter(PrayerRequest.status == "in_progress").count()
    answered_requests = db.query(PrayerRequest).filter(PrayerRequest.status == "answered").count()
    private_requests = db.query(PrayerRequest).filter(PrayerRequest.is_private == True).count()
    
    # Recent requests (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_requests = db.query(PrayerRequest).filter(PrayerRequest.created_at >= seven_days_ago).count()
    
    return {
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "in_progress_requests": in_progress_requests,
        "answered_requests": answered_requests,
        "private_requests": private_requests,
        "recent_requests": recent_requests
    }
