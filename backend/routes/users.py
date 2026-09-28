from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import User, LibraryItem, PrayerRequest
from schemas import User as UserSchema, UserUpdate, UserCreate, FirebaseUserSyncBody
from utils.auth import get_current_user, get_current_admin_user
from utils.firebase_admin_auth import require_firebase_user
from utils.user_sync import upsert_user_from_profile

router = APIRouter()

@router.post("/sync-firebase", response_model=UserSchema)
async def sync_firebase_user(
    body: FirebaseUserSyncBody,
    claims: dict = Depends(require_firebase_user),
    db: Session = Depends(get_db),
):
    """Upsert the signed-in Firebase user into PostgreSQL (Members list / legacy APIs)."""
    uid = claims["uid"]
    user = upsert_user_from_profile(
        db,
        firebase_uid=uid,
        email=claims.get("email"),
        full_name=body.full_name or claims.get("name"),
        phone=body.phone,
        location=body.location,
        grade=body.grade,
        role=body.role,
    )
    return user

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    # Check if email/username already exists (if being changed)
    if user_data.email and user_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if user_data.username and user_data.username != current_user.username:
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_admin: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    query = db.query(User)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.username.ilike(search_term))
        )
    
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific user by ID (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email/username already exists (if being changed)
    if user_data.email and user_data.email != user.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if user_data.username and user_data.username != user.username:
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has associated data
    library_items = db.query(LibraryItem).filter(LibraryItem.author_id == user_id).count()
    prayer_requests = db.query(PrayerRequest).filter(PrayerRequest.requester_id == user_id).count()
    
    if library_items > 0 or prayer_requests > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with associated data. Consider deactivating instead."
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Deactivate a user (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.post("/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Activate a user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "User activated successfully"}

@router.get("/stats/overview")
async def get_user_stats(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Get user statistics overview (admin only)."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    regular_users = total_users - admin_users
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_registrations = db.query(User).filter(User.created_at >= thirty_days_ago).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_users": admin_users,
        "regular_users": regular_users,
        "recent_registrations": recent_registrations
    }
