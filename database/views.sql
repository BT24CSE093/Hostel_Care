USE hostelcare_db;

CREATE OR REPLACE VIEW v_complaint_details AS
SELECT
    c.complaint_id,
    c.title,
    c.description,
    c.priority,
    c.status,
    c.created_at,
    u.full_name AS student_name,
    r.room_number,
    h.hostel_name,
    cc.category_name
FROM complaints c
JOIN student_profiles sp
    ON c.student_id = sp.student_id
JOIN users u
    ON sp.user_id = u.user_id
JOIN rooms r
    ON c.room_id = r.room_id
JOIN hostels h
    ON r.hostel_id = h.hostel_id
JOIN complaint_categories cc
    ON c.category_id = cc.category_id;