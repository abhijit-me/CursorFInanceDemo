-- Fix demo user password to use BCrypt hash for "demo123"
-- This BCrypt hash is for the password "demo123"
UPDATE users 
SET password_hash = '$2a$11$XQKvJrYLQv0x5o5N5EQ0qO4rK7xqV4YPf8H9WZVxH8qBXJqKQqH9G'
WHERE email = 'demo@financeapp.com';

-- Verify the update
SELECT email, username, first_name, last_name, LEFT(password_hash, 30) as password_hash_preview
FROM users 
WHERE email = 'demo@financeapp.com';
