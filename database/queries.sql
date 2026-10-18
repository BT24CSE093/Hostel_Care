USE hostelcare_db;

-- 1. Count complaints by status
SELECT status, COUNT(*) AS total
FROM complaints
GROUP BY status;

-- 2. Complaints by category
SELECT cc.category_name, COUNT(*) AS total
FROM complaints c
JOIN complaint_categories cc
    ON c.category_id = cc.category_id
GROUP BY cc.category_id, cc.category_name
ORDER BY total DESC;

-- 3. Complaints by hostel
SELECT h.hostel_name, COUNT(*) AS total
FROM complaints c
JOIN rooms r ON c.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
GROUP BY h.hostel_id, h.hostel_name;

-- 4. Average resolution time in hours
SELECT
    AVG(TIMESTAMPDIFF(
        HOUR, c.created_at, h.completed_at
    )) AS avg_resolution_hours
FROM complaints c
JOIN maintenance_work_logs h
    ON c.complaint_id = h.complaint_id
WHERE h.completed_at IS NOT NULL;

-- 5. Total maintenance expenses
SELECT
    COALESCE(SUM(amount), 0) AS total_expenses
FROM maintenance_expenses;

-- 6. Staff workload
SELECT
    u.full_name,
    COUNT(*) AS active_assignments
FROM complaint_assignments ca
JOIN staff_profiles sp ON ca.staff_id = sp.staff_id
JOIN users u ON sp.user_id = u.user_id
WHERE ca.assignment_status = 'ACTIVE'
GROUP BY sp.staff_id, u.full_name;

-- 7. Complaints awaiting assignment
SELECT *
FROM complaints
WHERE status IN ('SUBMITTED', 'UNDER_REVIEW');

-- 8. Feedback summary
SELECT
    COUNT(*) AS feedback_count,
    ROUND(AVG(rating), 2) AS average_rating
FROM feedback;

-- 9. Monthly complaint count
SELECT
    DATE_FORMAT(created_at, '%Y-%m') AS month,
    COUNT(*) AS total_complaints
FROM complaints
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month;

-- 10. Students with the most complaints
SELECT
    u.full_name,
    COUNT(*) AS complaint_count
FROM complaints c
JOIN student_profiles sp ON c.student_id = sp.student_id
JOIN users u ON sp.user_id = u.user_id
GROUP BY sp.student_id, u.full_name
ORDER BY complaint_count DESC;