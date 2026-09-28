from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for Firebase users
    firebase_uid = Column(String, unique=True, index=True, nullable=True)  # Firebase user ID
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    grade = Column(String, nullable=True)  # Grade/Level: 9th Grade, 10th Grade, College, etc.
    role = Column(String, nullable=True)  # Member, Admin, Pastor, Youth Leader
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    library_items = relationship("LibraryItem", back_populates="author_user")

class LibraryItem(Base):
    __tablename__ = "library_items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)  # book, blog, quotes
    category = Column(String, nullable=False)  # devotional, ministry, relationships, etc.
    description = Column(Text, nullable=False)
    cover_image = Column(String)  # File path to uploaded image
    is_free = Column(Boolean, default=True)
    price = Column(Float, nullable=True)
    access_code = Column(String, nullable=True)
    preview_content = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    tags = Column(String)  # Comma-separated tags
    rating = Column(Float, default=0.0)
    downloads = Column(Integer, default=0)
    views = Column(Integer, default=0)
    publish_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author_user = relationship("User", back_populates="library_items")

class PrayerRequest(Base):
    __tablename__ = "prayer_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    is_private = Column(Boolean, default=True)
    status = Column(String, default="pending")  # pending, answered, in_progress
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # prayer, service, devotional, empowerment, social, wisdom
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(String, nullable=True)  # e.g., "04:00", "20:00"
    location = Column(String, nullable=True)
    image = Column(String, nullable=True)  # File path to uploaded image
    max_attendees = Column(Integer, nullable=True)
    current_attendees = Column(Integer, default=0)
    featured = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Podcast(Base):
    __tablename__ = "podcasts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    host = Column(String, nullable=False)
    type = Column(String, nullable=False)  # episode, live, series
    category = Column(String, nullable=False)  # spiritual-development, relationships, etc.
    description = Column(Text, nullable=False)
    cover = Column(String, nullable=True)  # File path to cover image
    duration = Column(String, nullable=True)  # e.g., "15:30", "Live", "Series"
    publish_date = Column(DateTime(timezone=True), server_default=func.now())
    is_live = Column(Boolean, default=False)
    is_free = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    plays = Column(Integer, default=0)
    tags = Column(String, nullable=True)  # Comma-separated tags
    audio_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class GeniusAcademyCourse(Base):
    __tablename__ = "genius_academy_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    instructor = Column(String, nullable=False)
    category = Column(String, nullable=False)  # relationships, personal-development, etc.
    level = Column(String, nullable=False)  # beginner, intermediate, advanced
    description = Column(Text, nullable=False)
    cover = Column(String, nullable=True)  # File path to cover image
    duration = Column(String, nullable=True)  # e.g., "12 weeks"
    sessions = Column(Integer, nullable=True)
    mentorship_hours = Column(String, nullable=True)  # e.g., "40hrs of mentorship"
    students = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    is_enrolled = Column(Boolean, default=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    bonus = Column(String, nullable=True)  # e.g., "2 FREE BOOKS!"
    curriculum = Column(Text, nullable=True)  # JSON string or newline-separated
    features = Column(Text, nullable=True)  # JSON string or newline-separated
    whatsapp_number = Column(String, nullable=True)  # For enrollment
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Devotional(Base):
    __tablename__ = "devotionals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    scripture = Column(String, nullable=False)
    verse = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # Full devotional content
    read_time = Column(String, nullable=True)  # e.g., "5 min read"
    date = Column(DateTime(timezone=True), nullable=False)
    featured = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # high, medium, low
    date = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
