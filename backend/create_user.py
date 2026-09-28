












































































#!/usr/bin/env python3
"""Create a user in the database with proper password hashing."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Base, User
import bcrypt

# Create tables
Base.metadata.create_all(bind=engine)

def create_user(username, password, email, full_name, is_admin=False):
    """Create a user with bcrypt password hashing."""
    db = SessionLocal()
    try:
        # Check if user exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"User '{username}' already exists")
            return existing
        
        # Hash password using bcrypt directly
        password_bytes = password.encode('utf-8')
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        hashed_str = hashed.decode('utf-8')
        
        # Create user
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=hashed_str,
            is_admin=is_admin,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ User '{username}' created successfully!")
        return user
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Create admin user
    create_user("admin", "admin123", "admin@fog.com", "FOG Administrator", is_admin=True)
    # Create regular user
    create_user("user", "user123", "user@fog.com", "Regular User", is_admin=False)
    print("\n✅ Users created!")

