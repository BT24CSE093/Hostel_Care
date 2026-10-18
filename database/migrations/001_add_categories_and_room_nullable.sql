-- HostelCare Migration 001: Add Mess, Sports, Network Categories & Support Location-Independent Complaints
-- Database: hostelcare_db

USE hostelcare_db;

-- 1. Insert new categories safely without duplicates
INSERT INTO complaint_categories (category_name, description, default_priority)
SELECT 'Mess', 'Food quality, mess hygiene, drinking water, menu availability and timings', 'HIGH'
WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Mess');

INSERT INTO complaint_categories (category_name, description, default_priority)
SELECT 'Sports', 'Sports equipment, facility maintenance, courts and sports area lighting', 'MEDIUM'
WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Sports');

INSERT INTO complaint_categories (category_name, description, default_priority)
SELECT 'Network', 'Wi-Fi, internet speed, connectivity, authentication and network coverage', 'HIGH'
WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Network');

-- 2. Add reported_room_number column to complaints table if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'complaints'
  AND COLUMN_NAME = 'reported_room_number';

SET @stmt = IF(@col_exists = 0,
  'ALTER TABLE complaints ADD COLUMN reported_room_number VARCHAR(20) DEFAULT NULL AFTER room_id;',
  'SELECT "Column reported_room_number already exists" AS info;'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

-- 3. Modify room_id column in complaints table to be NULLABLE (preserves foreign key)
ALTER TABLE complaints MODIFY COLUMN room_id INT NULL;

-- 4. Update view v_complaint_details with LEFT JOIN for room and hostel
CREATE OR REPLACE VIEW v_complaint_details AS
SELECT
    c.complaint_id,
    c.title,
    c.description,
    c.priority,
    c.status,
    c.created_at,
    u.full_name AS student_name,
    COALESCE(r.room_number, c.reported_room_number) AS room_number,
    h.hostel_name,
    cc.category_name,
    c.reported_room_number
FROM complaints c
JOIN student_profiles sp
    ON c.student_id = sp.student_id
JOIN users u
    ON sp.user_id = u.user_id
LEFT JOIN rooms r
    ON c.room_id = r.room_id
LEFT JOIN hostels h
    ON r.hostel_id = h.hostel_id
JOIN complaint_categories cc
    ON c.category_id = cc.category_id;
