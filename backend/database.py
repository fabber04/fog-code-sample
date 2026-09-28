from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - Railway provides both DATABASE_URL (internal) and DATABASE_PUBLIC_URL (external)
# Prefer DATABASE_URL for internal connections, fall back to DATABASE_PUBLIC_URL if needed
DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL or not DATABASE_URL.strip():
    # Fall back to public URL if internal URL is not available
    DATABASE_URL = os.getenv("DATABASE_PUBLIC_URL", "")

# Handle Railway's PostgreSQL URL format
# Railway sometimes provides postgres:// which needs to be converted to postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# If DATABASE_URL is empty or invalid, fall back to SQLite
if not DATABASE_URL or not DATABASE_URL.strip():
    print("⚠️  WARNING: DATABASE_URL not set, using SQLite (not recommended for production)")
    DATABASE_URL = "sqlite:///./fog_platform.db"

# Validate DATABASE_URL format
if not (DATABASE_URL.startswith("sqlite://") or 
        DATABASE_URL.startswith("postgresql://") or 
        DATABASE_URL.startswith("postgres://")):
    raise ValueError(
        f"Invalid DATABASE_URL format: {DATABASE_URL[:20]}...\n"
        "Expected format: postgresql://user:pass@host:port/dbname or sqlite:///./file.db"
    )

# For PostgreSQL (Railway), DATABASE_URL is already in the correct format
# For SQLite, we need to handle the connection args
if DATABASE_URL.startswith("sqlite"):
    # SQLite connection args
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL connection args for Railway
    # Railway uses internal networking, so we may need connection pooling
    connect_args = {}
    # Add connection pool settings for better reliability
    pool_pre_ping = True  # Verify connections before using them
    pool_recycle = 300    # Recycle connections after 5 minutes

# Create engine with appropriate settings
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,  # Verify connections before using (important for Railway)
        pool_recycle=300,    # Recycle connections after 5 minutes
        echo=False,          # Set to True for SQL query logging (debug only)
        pool_size=5,         # Connection pool size
        max_overflow=10      # Maximum overflow connections
    )
    print(f" Database engine created successfully")
    print(f" Database type: {'SQLite' if DATABASE_URL.startswith('sqlite') else 'PostgreSQL'}")
    # Test the connection
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"Database connection test passed")
    except Exception as conn_error:
        print(f" Database connection test failed: {conn_error}")
        print(f"   Server will start, but database operations may fail")
except Exception as e:
    print(f"Error creating database engine: {e}")
    print(f"   DATABASE_URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"   DATABASE_URL: {DATABASE_URL}")
    # Don't raise - let the app start and handle DB errors gracefully
    print(f" Continuing without database connection (app may have limited functionality)")
    raise  # Re-raise for now, but we could make this more graceful

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
