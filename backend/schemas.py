from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    role: Optional[str] = None
    is_admin: Optional[bool] = None

class FirebaseUserSyncBody(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    role: Optional[str] = None
    firebase_uid: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Library item schemas
class LibraryItemBase(BaseModel):
    title: str
    author: str
    type: str
    category: str
    description: str
    is_free: bool
    price: Optional[float] = None
    access_code: Optional[str] = None
    preview_content: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None

class LibraryItemCreate(LibraryItemBase):
    pass

class LibraryItemUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_free: Optional[bool] = None
    price: Optional[float] = None
    access_code: Optional[str] = None
    preview_content: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None

class LibraryItem(LibraryItemBase):
    id: int
    author_id: int
    cover_image: Optional[str] = None
    rating: float
    downloads: int
    views: int
    publish_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Prayer request schemas
class PrayerRequestBase(BaseModel):
    title: str
    description: str
    is_private: bool = True

class PrayerRequestCreate(PrayerRequestBase):
    pass

class PrayerRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None
    status: Optional[str] = None

class PrayerRequest(PrayerRequestBase):
    id: int
    requester_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Event schemas
class EventBase(BaseModel):
    title: str
    description: str
    category: str
    date: datetime
    time: Optional[str] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None
    featured: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None
    current_attendees: Optional[int] = None
    featured: Optional[bool] = None

class Event(EventBase):
    id: int
    image: Optional[str] = None
    current_attendees: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Podcast schemas
class PodcastBase(BaseModel):
    title: str
    host: str
    type: str
    category: str
    description: str
    duration: Optional[str] = None
    is_live: bool = False
    is_free: bool = True
    tags: Optional[str] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    cover: Optional[str] = None

class PodcastCreate(PodcastBase):
    pass

class PodcastUpdate(BaseModel):
    title: Optional[str] = None
    host: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    is_live: Optional[bool] = None
    is_free: Optional[bool] = None
    tags: Optional[str] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    cover: Optional[str] = None

class Podcast(PodcastBase):
    id: int
    cover: Optional[str] = None
    publish_date: datetime
    rating: float
    plays: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Genius Academy Course schemas
class GeniusAcademyCourseBase(BaseModel):
    title: str
    instructor: str
    category: str
    level: str
    description: str
    duration: Optional[str] = None
    sessions: Optional[int] = None
    mentorship_hours: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    start_date: Optional[datetime] = None
    tags: Optional[str] = None
    bonus: Optional[str] = None
    curriculum: Optional[str] = None
    features: Optional[str] = None
    whatsapp_number: Optional[str] = None

class GeniusAcademyCourseCreate(GeniusAcademyCourseBase):
    pass

class GeniusAcademyCourseUpdate(BaseModel):
    title: Optional[str] = None
    instructor: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    sessions: Optional[int] = None
    mentorship_hours: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    start_date: Optional[datetime] = None
    tags: Optional[str] = None
    bonus: Optional[str] = None
    curriculum: Optional[str] = None
    features: Optional[str] = None
    whatsapp_number: Optional[str] = None

class GeniusAcademyCourse(GeniusAcademyCourseBase):
    id: int
    cover: Optional[str] = None
    students: int
    rating: float
    is_enrolled: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Devotional schemas
class DevotionalBase(BaseModel):
    title: str
    scripture: str
    verse: str
    author: str
    content: Optional[str] = None
    read_time: Optional[str] = None
    date: datetime
    featured: bool = False

class DevotionalCreate(DevotionalBase):
    pass

class DevotionalUpdate(BaseModel):
    title: Optional[str] = None
    scripture: Optional[str] = None
    verse: Optional[str] = None
    author: Optional[str] = None
    content: Optional[str] = None
    read_time: Optional[str] = None
    date: Optional[datetime] = None
    featured: Optional[bool] = None

class Devotional(DevotionalBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Announcement schemas
class AnnouncementBase(BaseModel):
    title: str
    content: str
    priority: str = "medium"
    expires_at: Optional[datetime] = None
    is_active: bool = True

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class Announcement(AnnouncementBase):
    id: int
    date: datetime
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
