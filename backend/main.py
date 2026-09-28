from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from dotenv import load_dotenv
import os

from database import engine, get_db
from models import Base
from sqlalchemy.orm import Session
from routes import auth, library, users, prayer, events, podcasts, courses, devotionals, announcements
from routes import internal_notifications, admin_app
from utils.auth import get_current_user
from file_server import initialize_storage, STORAGE_DIR

# Load environment variables
load_dotenv()

# Create database tables
try:
    print("Initializing database tables...")
    # Test connection first
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(" Database connection verified")
    except Exception as conn_err:
        print(f"  Database connection test failed: {conn_err}")
        print("   Will retry table creation...")
    
    Base.metadata.create_all(bind=engine)
    print(" Database tables created successfully")
    
    # Verify tables were created
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"   Created {len(tables)} tables: {', '.join(sorted(tables))}")
    except Exception as inspect_err:
        print(f"  Could not verify tables: {inspect_err}")
except Exception as e:
    print(f" Error creating database tables: {e}")
    import traceback
    traceback.print_exc()
    print("  Server will continue, but database operations may fail")
    print("   Check Railway logs and DATABASE_URL configuration")

# Initialize file storage
try:
    initialize_storage()
except Exception as e:
    print(f" Warning: File storage initialization failed: {e}")
    print("   Server will continue, but file uploads may not work properly")

app = FastAPI(
    title="FOG API",
    description="Backend API for FOG (Faith-based Organization) Platform",
    version="1.0.0"
)

# CORS middleware
# Get allowed origins from environment or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://familyofgreatness.com",
    "https://www.familyofgreatness.com",
]
# Combine default origins with environment origins, filter out empty strings
allow_origins = default_origins + [origin.strip() for origin in cors_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.up\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Mount static files for uploaded content
# Legacy uploads directory (for backward compatibility)
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/events", exist_ok=True)
os.makedirs("uploads/podcasts", exist_ok=True)
os.makedirs("uploads/podcasts/audio", exist_ok=True)
os.makedirs("uploads/courses", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Mount file server storage directory
# This serves files from the centralized storage location
try:
    storage_path = str(STORAGE_DIR)
    if os.path.exists(storage_path):
        app.mount("/storage", StaticFiles(directory=storage_path), name="storage")
        print(f"Storage mounted at /storage from {storage_path}")
    else:
        print(f"Warning: Storage directory not found: {storage_path}")
except Exception as e:
    print(f" Warning: Failed to mount storage: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(library.router, prefix="/api/library", tags=["Library"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(prayer.router, prefix="/api/prayer", tags=["Prayer Requests"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(podcasts.router, prefix="/api/podcasts", tags=["Podcasts"])
app.include_router(courses.router, prefix="/api/courses", tags=["Genius Academy Courses"])
app.include_router(devotionals.router, prefix="/api/devotionals", tags=["Devotionals"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(internal_notifications.router, prefix="/api/internal", tags=["Internal"])
app.include_router(admin_app.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to FOG API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "FOG API is running",
        "git_sha": os.getenv("RAILWAY_GIT_COMMIT_SHA", "unknown"),
        "admin_api": True,
    }

@app.get("/api/test-db")
async def test_database(db: Session = Depends(get_db)):
    """Test database connection and table existence."""
    from sqlalchemy import inspect
    from models import Podcast
    
    try:
        # Test connection and get table names
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # Try to query
        count = db.query(Podcast).count()
        return {
            "status": "success",
            "message": "Database connection successful",
            "podcasts_count": count,
            "tables_exist": True,
            "tables": tables,
            "database_url": os.getenv("DATABASE_URL", "not set")[:50] + "..." if os.getenv("DATABASE_URL") else "not set"
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": f"Database error: {str(e)}",
            "tables_exist": False,
            "traceback": traceback.format_exc(),
            "database_url": os.getenv("DATABASE_URL", "not set")[:50] + "..." if os.getenv("DATABASE_URL") else "not set"
        }

@app.post("/api/init-db")
async def init_database():
    """Manually initialize database tables."""
    try:
        print("Manually initializing database tables...")
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return {
            "status": "success",
            "message": "Database tables created successfully",
            "tables": tables,
            "count": len(tables)
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        print(f"Error in init-db: {error_msg}")
        print(tb)
        return {
            "status": "error",
            "message": f"Failed to create tables: {error_msg}",
            "traceback": tb
        }

@app.post("/api/create-tables-sql")
async def create_tables_from_sql():
    """Create tables by executing SQL script."""
    from sqlalchemy import text, inspect
    
    # SQL script to create all tables
    sql_script = """
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        hashed_password VARCHAR(255),
        firebase_uid VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        location VARCHAR(255),
        role VARCHAR(50),
        is_admin BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
    
    -- Library Items table
    CREATE TABLE IF NOT EXISTS library_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        cover_image VARCHAR(255),
        is_free BOOLEAN DEFAULT TRUE,
        price DECIMAL(10, 2),
        access_code VARCHAR(100),
        preview_content TEXT,
        content TEXT,
        tags VARCHAR(255),
        rating DECIMAL(3, 2) DEFAULT 0.0,
        downloads INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_library_items_title ON library_items(title);
    CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
    CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);
    
    -- Prayer Requests table
    CREATE TABLE IF NOT EXISTS prayer_requests (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        is_private BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Events table
    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        time VARCHAR(10),
        location VARCHAR(255),
        image VARCHAR(255),
        max_attendees INTEGER,
        current_attendees INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_events_title ON events(title);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    
    -- Podcasts table
    CREATE TABLE IF NOT EXISTS podcasts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        host VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        cover VARCHAR(255),
        duration VARCHAR(50),
        publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_live BOOLEAN DEFAULT FALSE,
        is_free BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        plays INTEGER DEFAULT 0,
        tags VARCHAR(255),
        audio_url VARCHAR(500),
        transcript TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_podcasts_title ON podcasts(title);
    CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts(category);
    CREATE INDEX IF NOT EXISTS idx_podcasts_type ON podcasts(type);
    
    -- Genius Academy Courses table
    CREATE TABLE IF NOT EXISTS genius_academy_courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        cover VARCHAR(255),
        duration VARCHAR(100),
        sessions INTEGER,
        mentorship_hours VARCHAR(100),
        students INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        is_enrolled BOOLEAN DEFAULT FALSE,
        start_date TIMESTAMP WITH TIME ZONE,
        tags VARCHAR(255),
        bonus TEXT,
        curriculum TEXT,
        features TEXT,
        whatsapp_number VARCHAR(50),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_courses_title ON genius_academy_courses(title);
    CREATE INDEX IF NOT EXISTS idx_courses_category ON genius_academy_courses(category);
    
    -- Devotionals table
    CREATE TABLE IF NOT EXISTS devotionals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        scripture VARCHAR(255) NOT NULL,
        verse TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        content TEXT,
        read_time VARCHAR(50),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_devotionals_title ON devotionals(title);
    CREATE INDEX IF NOT EXISTS idx_devotionals_date ON devotionals(date);
    
    -- Announcements table
    CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
    CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
    """
    
    try:
        print("Creating tables from SQL script...")
        db = next(get_db())
        try:
            # Split SQL script into individual statements and execute one at a time
            # Remove comments and split by semicolons
            statements = [s.strip() for s in sql_script.split(';') if s.strip() and not s.strip().startswith('--')]
            
            for statement in statements:
                if statement:  # Skip empty statements
                    try:
                        db.execute(text(statement))
                    except Exception as e:
                        # Some statements might fail if tables/indexes already exist, that's OK
                        print(f"Note: {str(e)[:100]}")
            
            db.commit()
            
            # Verify tables were created
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            return {
                "status": "success",
                "message": "Tables created successfully from SQL",
                "tables": tables,
                "count": len(tables)
            }
        finally:
            db.close()
    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        print(f"Error creating tables from SQL: {error_msg}")
        print(tb)
        return {
            "status": "error",
            "message": f"Failed to create tables: {error_msg}",
            "traceback": tb
        }

@app.get("/api/view-tables")
async def view_all_tables(db: Session = Depends(get_db)):
    """View all tables and their data."""
    from sqlalchemy import inspect, text
    
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        result = {}
        
        for table in sorted(tables):
            # Get row count
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = count_result.scalar()
            
            # Get column names
            columns = [col['name'] for col in inspector.get_columns(table)]
            
            # Get sample data (first 10 rows)
            if count > 0:
                data_result = db.execute(text(f"SELECT * FROM {table} LIMIT 10"))
                rows = data_result.fetchall()
                
                # Convert rows to dictionaries
                table_data = []
                for row in rows:
                    row_dict = {}
                    for col_name, value in zip(columns, row):
                        # Convert values to JSON-serializable format
                        if value is None:
                            row_dict[col_name] = None
                        elif isinstance(value, (str, int, float, bool)):
                            row_dict[col_name] = value
                        else:
                            row_dict[col_name] = str(value)
                    table_data.append(row_dict)
            else:
                table_data = []
            
            result[table] = {
                "columns": columns,
                "row_count": count,
                "sample_data": table_data,
                "showing": min(10, count) if count > 0 else 0
            }
        
        return {
            "status": "success",
            "tables": result,
            "total_tables": len(tables)
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": f"Error viewing tables: {str(e)}",
            "traceback": traceback.format_exc()
        }

if __name__ == "__main__":
    try:
        # Get port from environment (Railway provides this) or default to 8000
        port = int(os.getenv("PORT", 8000))
        # Only enable reload in development
        reload = os.getenv("ENVIRONMENT", "production") != "production"
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=reload,
            log_level="info"
        )
    except Exception as e:
        print(f"Server failed to start: {e}")
        import traceback
        traceback.print_exc()
        raise
