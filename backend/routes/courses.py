from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from database import get_db
from models import GeniusAcademyCourse, User
from schemas import GeniusAcademyCourseCreate, GeniusAcademyCourseUpdate, GeniusAcademyCourse as CourseSchema
from utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

# File upload configuration
UPLOAD_DIR = "uploads/courses"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_valid_file_extension(filename: str) -> bool:
    """Check if file has valid extension."""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

@router.get("/", response_model=List[CourseSchema])
async def get_courses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all courses with optional filtering."""
    query = db.query(GeniusAcademyCourse)
    
    if category and category != "all":
        query = query.filter(GeniusAcademyCourse.category == category)
    
    if level and level != "all":
        query = query.filter(GeniusAcademyCourse.level == level)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (GeniusAcademyCourse.title.ilike(search_term)) |
            (GeniusAcademyCourse.instructor.ilike(search_term)) |
            (GeniusAcademyCourse.description.ilike(search_term))
        )
    
    # Order by creation date (newest first)
    query = query.order_by(GeniusAcademyCourse.created_at.desc())
    
    courses = query.offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course by ID."""
    course = db.query(GeniusAcademyCourse).filter(GeniusAcademyCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=CourseSchema)
async def create_course(
    course_data: GeniusAcademyCourseCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new course (admin only)."""
    db_course = GeniusAcademyCourse(
        **course_data.dict(),
        created_by=current_user.id
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.put("/{course_id}", response_model=CourseSchema)
async def update_course(
    course_id: int,
    course_data: GeniusAcademyCourseUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a course (admin only)."""
    db_course = db.query(GeniusAcademyCourse).filter(GeniusAcademyCourse.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db_course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a course (admin only)."""
    db_course = db.query(GeniusAcademyCourse).filter(GeniusAcademyCourse.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete associated cover image if exists
    if db_course.cover:
        try:
            file_path = os.path.join(UPLOAD_DIR, db_course.cover)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    db.delete(db_course)
    db.commit()
    
    return {"message": "Course deleted successfully"}

@router.post("/upload-cover")
async def upload_course_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a cover image for courses (admin only)."""
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
    filename = f"course_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    return {"filename": filename, "url": f"/uploads/courses/{filename}"}
