#!/usr/bin/env python3
"""
Database initialization script for FOG (Family of Greatness) Platform
Creates tables and populates with sample data
"""

import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base, User, LibraryItem
from utils.auth import get_password_hash

def init_db():
    """Initialize the database with tables and sample data."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Creating sample data...")
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("Creating admin user...")
            admin_user = User(
                email="admin@fog.com",
                username="admin",
                full_name="FOG Administrator",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("Admin user created successfully!")
        else:
            print("Admin user already exists.")
        
        # Check if regular user exists
        regular_user = db.query(User).filter(User.username == "user").first()
        if not regular_user:
            print("Creating regular user...")
            regular_user = User(
                email="user@fog.com",
                username="user",
                full_name="Regular User",
                hashed_password=get_password_hash("user123"),
                is_admin=False,
                is_active=True
            )
            db.add(regular_user)
            db.commit()
            db.refresh(regular_user)
            print("Regular user created successfully!")
        else:
            print("Regular user already exists.")
        
        # Check if sample library items exist
        existing_items = db.query(LibraryItem).count()
        if existing_items == 0:
            print("Creating sample library items...")
            
            # Sample library items
            sample_items = [
                {
                    "title": "Daily Devotional Guide",
                    "author": "FOG Ministry Team",
                    "type": "book",
                    "category": "devotional",
                    "description": "A comprehensive guide for daily spiritual growth and reflection.",
                    "is_free": True,
                    "preview_content": "Start your day with purpose and faith...",
                    "content": "Complete devotional content for daily spiritual growth...",
                    "tags": "devotional, daily, spiritual growth",
                    "author_id": admin_user.id
                },
                {
                    "title": "Building Strong Relationships",
                    "author": "Pastor Johnson",
                    "type": "book",
                    "category": "relationships",
                    "description": "Biblical principles for building and maintaining healthy relationships.",
                    "is_free": False,
                    "price": 19.99,
                    "access_code": "REL2024",
                    "preview_content": "Relationships are the foundation of our spiritual journey...",
                    "content": "Complete guide to building strong relationships...",
                    "tags": "relationships, biblical, principles",
                    "author_id": admin_user.id
                },
                {
                    "title": "Youth Ministry Insights",
                    "author": "Youth Leader Sarah",
                    "type": "blog",
                    "category": "ministry",
                    "description": "Practical insights and strategies for effective youth ministry.",
                    "is_free": True,
                    "preview_content": "Youth ministry requires patience, love, and understanding...",
                    "content": "Complete blog post about youth ministry...",
                    "tags": "youth ministry, leadership, strategies",
                    "author_id": admin_user.id
                },
                {
                    "title": "Inspirational Quotes Collection",
                    "author": "FOG Community",
                    "type": "quotes",
                    "category": "inspiration",
                    "description": "A collection of inspiring quotes from scripture and spiritual leaders.",
                    "is_free": True,
                    "preview_content": "Faith is the bird that feels the light...",
                    "content": "Complete collection of inspirational quotes...",
                    "tags": "quotes, inspiration, scripture",
                    "author_id": admin_user.id
                }
            ]
            
            for item_data in sample_items:
                library_item = LibraryItem(**item_data)
                db.add(library_item)
            
            db.commit()
            print(f"Created {len(sample_items)} sample library items!")
        else:
            print(f"Database already contains {existing_items} library items.")
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error during database initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting FOG (Family of Greatness) Platform database initialization...")
    init_db()
    print("Done!")
