-- SQL queries to view podcasts in Railway database

-- View all podcasts
SELECT id, title, category, created_at 
FROM podcasts 
ORDER BY id;

-- Count podcasts
SELECT COUNT(*) as total_podcasts FROM podcasts;

-- View podcast details
SELECT 
    id,
    title,
    host,
    category,
    type,
    audio_url,
    cover,
    created_at
FROM podcasts
ORDER BY id
LIMIT 10;

-- View all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

