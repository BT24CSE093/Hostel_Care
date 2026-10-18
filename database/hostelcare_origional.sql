CREATE DATABASE hostelcare_db;

USE hostelcare_db;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mobile VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'WARDEN', 'STAFF', 'ADMIN')
        NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostels (
    hostel_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150)
);

CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,

    FOREIGN KEY (hostel_id)
        REFERENCES hostels(hostel_id),

    UNIQUE (hostel_id, room_number),
    CHECK (capacity > 0)
);

USE hostelcare_db;
SHOW TABLES;

USE hostelcare_db;

CREATE TABLE student_profiles (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(30) NOT NULL UNIQUE,
    course VARCHAR(100),
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE staff_profiles (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    staff_type ENUM(
        'ELECTRICIAN',
        'PLUMBER',
        'CARPENTER',
        'CLEANER',
        'GENERAL'
    ) NOT NULL,
    availability ENUM(
        'AVAILABLE',
        'BUSY',
        'INACTIVE'
    ) DEFAULT 'AVAILABLE',
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE room_allocations (
    allocation_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,

    FOREIGN KEY (student_id)
        REFERENCES student_profiles(student_id),

    FOREIGN KEY (room_id)
        REFERENCES rooms(room_id),

    CHECK (end_date IS NULL OR end_date >= start_date)
);

SHOW TABLES;

USE hostelcare_db;

CREATE TABLE complaint_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255),
    default_priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
        DEFAULT 'MEDIUM'
);

CREATE TABLE complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
        DEFAULT 'MEDIUM',
    status ENUM(
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'CANCELLED'
    ) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES student_profiles(student_id),
    FOREIGN KEY (room_id)
        REFERENCES rooms(room_id),
    FOREIGN KEY (category_id)
        REFERENCES complaint_categories(category_id),

    INDEX idx_complaints_status_created (status, created_at)
);

CREATE TABLE complaint_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignment_status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED')
        DEFAULT 'ACTIVE',

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (staff_id)
        REFERENCES staff_profiles(staff_id),
    FOREIGN KEY (assigned_by)
        REFERENCES users(user_id),

    INDEX idx_assignment_staff_status
        (staff_id, assignment_status)
);

CREATE TABLE complaint_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by INT NOT NULL,
    remarks VARCHAR(500),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (changed_by)
        REFERENCES users(user_id),

    INDEX idx_history_complaint_date
        (complaint_id, changed_at)
);

SHOW TABLES;

USE hostelcare_db;

CREATE TABLE complaint_attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (uploaded_by)
        REFERENCES users(user_id)
);

CREATE TABLE maintenance_work_logs (
    work_log_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    work_description TEXT NOT NULL,
    started_at DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (staff_id)
        REFERENCES staff_profiles(staff_id),

    CHECK (
        completed_at IS NULL
        OR started_at IS NULL
        OR completed_at >= started_at
    )
);

CREATE TABLE maintenance_expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    expense_type ENUM('LABOR', 'MATERIAL', 'OTHER') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (recorded_by)
        REFERENCES users(user_id),

    CHECK (amount >= 0)
);

CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    rating INT NOT NULL,
    comments VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id),
    FOREIGN KEY (student_id)
        REFERENCES student_profiles(student_id),

    CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    complaint_id INT,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
);

SHOW TABLES;

USE hostelcare_db;

-- 1. Hostels
INSERT INTO hostels (hostel_name, location)
VALUES
('Hostel A', 'North Campus'),
('Hostel B', 'South Campus');

-- 2. Rooms
INSERT INTO rooms (hostel_id, room_number, capacity)
VALUES
(1, '101', 2),
(1, '102', 2),
(2, '201', 3);

-- 3. Complaint categories
INSERT INTO complaint_categories
(category_name, description, default_priority)
VALUES
('Plumbing', 'Water leakage and tap problems', 'HIGH'),
('Electrical', 'Lights, fans and electrical faults', 'HIGH'),
('Cleaning', 'Room and common area cleaning', 'MEDIUM'),
('Furniture', 'Bed, chair and table repairs', 'LOW');

-- 4. Users
-- Demo passwords are placeholders; real accounts must use secure hashes.
INSERT INTO users
(full_name, email, mobile, password_hash, role)
VALUES
('Demo Student', 'student@example.com', '9000000001', 'DEMO_HASH', 'STUDENT'),
('Demo Warden', 'warden@example.com', '9000000002', 'DEMO_HASH', 'WARDEN'),
('Demo Electrician', 'staff@example.com', '9000000003', 'DEMO_HASH', 'STAFF'),
('Demo Admin', 'admin@example.com', '9000000004', 'DEMO_HASH', 'ADMIN');

-- 5. Student profile
INSERT INTO student_profiles
(user_id, roll_number, course)
VALUES (1, 'HC001', 'CSE');

-- 6. Staff profile
INSERT INTO staff_profiles
(user_id, staff_type, availability)
VALUES (3, 'ELECTRICIAN', 'AVAILABLE');

-- 7. Room allocation
INSERT INTO room_allocations
(student_id, room_id, start_date)
VALUES (1, 1, CURRENT_DATE);

SELECT * FROM hostels;
SELECT * FROM users;
SELECT * FROM student_profiles;
SELECT * FROM staff_profiles;
SELECT * FROM complaint_categories;

USE hostelcare_db;

INSERT INTO complaints
(student_id, room_id, category_id, title, description, priority, status)
VALUES
(1, 1, 1, 'Water leakage',
 'Bathroom tap is leaking continuously',
 'HIGH', 'ASSIGNED'),

(1, 1, 2, 'Fan not working',
 'Ceiling fan has stopped working',
 'MEDIUM', 'SUBMITTED');
 
 INSERT INTO complaint_assignments
(complaint_id, staff_id, assigned_by, assignment_status)
VALUES
(1, 1, 2, 'ACTIVE');

INSERT INTO complaint_assignments
(complaint_id, staff_id, assigned_by, assignment_status)
VALUES
(1, 1, 2, 'ACTIVE');

INSERT INTO complaint_status_history
(complaint_id, old_status, new_status, changed_by, remarks)
VALUES
(1, NULL, 'SUBMITTED', 1, 'Complaint registered'),
(1, 'SUBMITTED', 'ASSIGNED', 2, 'Assigned to electrician');

SELECT * FROM complaints;
SELECT * FROM complaint_assignments;
SELECT * FROM complaint_status_history;

USE hostelcare_db;
SHOW TABLES;