-- SQL script to create all tables in Railway PostgreSQL database
-- Run this in Railway's Query tab or via a database client

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'All tables created successfully!';
END $$;

