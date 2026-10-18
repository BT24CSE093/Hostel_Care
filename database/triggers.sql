USE hostelcare_db;

DELIMITER //

CREATE TRIGGER trg_complaint_status_history
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO complaint_status_history
        (complaint_id, old_status, new_status, changed_by, remarks)
        VALUES
        (
            NEW.complaint_id,
            OLD.status,
            NEW.status,
            1,
            'Status updated'
        );
    END IF;
END //

DELIMITER ;