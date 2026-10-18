USE hostelcare_db;

DELIMITER //

CREATE PROCEDURE AssignComplaint(
    IN p_complaint_id INT,
    IN p_staff_id INT,
    IN p_assigned_by INT
)
BEGIN
    DECLARE v_status VARCHAR(30);
    DECLARE v_old_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status
    INTO v_status
    FROM complaints
    WHERE complaint_id = p_complaint_id
    FOR UPDATE;

    IF v_status NOT IN ('SUBMITTED', 'UNDER_REVIEW') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Complaint cannot be assigned in its current status';
    END IF;

    SELECT availability
    INTO @staff_availability
    FROM staff_profiles
    WHERE staff_id = p_staff_id;

    IF @staff_availability IS NULL
       OR @staff_availability <> 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Staff member is not available';
    END IF;

    SET v_old_status = v_status;

    INSERT INTO complaint_assignments
        (complaint_id, staff_id, assigned_by, assignment_status)
    VALUES
        (p_complaint_id, p_staff_id, p_assigned_by, 'ACTIVE');

    UPDATE complaints
    SET status = 'ASSIGNED'
    WHERE complaint_id = p_complaint_id;

    INSERT INTO complaint_status_history
        (complaint_id, old_status, new_status, changed_by, remarks)
    VALUES
        (p_complaint_id, v_old_status, 'ASSIGNED',
         p_assigned_by, 'Complaint assigned to maintenance staff');

    COMMIT;
END //

DELIMITER ;