# HostelCare — Backend API & MySQL Integration

HostelCare is a comprehensive Hostel Maintenance & Complaint Tracking System designed as a DBMS college project. This repository contains the modular monolith backend built using Node.js, Express, TypeScript, and native MySQL 8+ connectivity.

---

## Architecture Overview

```text
backend/
├── src/
│   ├── config/
│   │   └── database.ts            # MySQL connection pool (mysql2/promise)
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification & RBAC authorization
│   │   ├── error.middleware.ts    # Centralized AppError handling & 404 router
│   │   └── validate.middleware.ts # Zod request body validation
│   ├── modules/
│   │   ├── auth/                  # Registration, login, profile (/api/auth)
│   │   ├── complaints/            # Complaint CRUD, status, assign (/api/complaints)
│   │   ├── hostels/               # Hostels, rooms, categories (/api/hostels)
│   │   ├── staff/                 # Staff directory & assignments (/api/staff)
│   │   └── dashboard/             # Aggregates, status/category counts (/api/dashboard)
│   ├── app.ts                     # Express app configuration & middleware pipeline
│   └── server.ts                  # Server entry point & startup DB ping
├── tests/
│   ├── middleware.test.ts         # Automated Jest unit tests
│   └── manual_test_plan.md        # Comprehensive manual test plan & curl commands
├── .env.example                   # Environment configuration template
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Documentation & API reference
```

---

## Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8+ (`mysql2/promise` connection pool, no ORM)
- **Security**: `helmet`, `cors`, `bcrypt` (password hashing), `jsonwebtoken` (RBAC JWTs)
- **Validation**: `zod`
- **Testing**: `jest`, `ts-jest`

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL 8.0+ running with `hostelcare_db` imported from `../database/hostelcare_backup.sql`.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` with your local MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=hostelcare_db
JWT_SECRET=replace_with_a_secure_long_random_secret_string
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Build TypeScript
```bash
npm run build
```

### 5. Run Development Server
```bash
npm run dev
```
The server will test database connectivity on startup and listen on `http://localhost:5000`.

### 6. Run Automated Tests
```bash
npm test
```

### 7. Database Migrations
Migrations are stored in `../database/migrations/`.
- `001_add_categories_and_room_nullable.sql`: Adds Mess, Sports, and Network categories, adds `reported_room_number`, and makes `room_id` nullable for location-independent complaints. Run via MySQL Workbench or `node ../database/run_migration.js`.

---

## API Endpoints Reference

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check & database ping |
| `POST` | `/api/auth/register` | Public | Register student/warden/staff/admin |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated profile |
| `GET` | `/api/hostels` | Public | List all hostels |
| `GET` | `/api/hostels/:id/rooms` | Public | List rooms for a specific hostel |
| `GET` | `/api/complaint-categories` | Public | List all complaint categories |
| `GET` | `/api/complaints` | Authenticated | List complaints (filtered by role) |
| `GET` | `/api/complaints/:id` | Authenticated | Get complaint details & status history |
| `POST` | `/api/complaints` | STUDENT | Submit a new complaint |
| `PATCH` | `/api/complaints/:id/status` | WARDEN, ADMIN, STAFF | Update status of a complaint |
| `POST` | `/api/complaints/:id/assign` | WARDEN, ADMIN | Assign complaint to staff member |
| `GET` | `/api/staff` | WARDEN, ADMIN | List all active staff |
| `GET` | `/api/staff/:id/assignments` | WARDEN, ADMIN, STAFF | View assignments for a staff member |
| `GET` | `/api/dashboard/summary` | WARDEN, ADMIN | Summary counters & KPI metrics |
| `GET` | `/api/dashboard/complaints-by-status` | WARDEN, ADMIN | Complaints breakdown by status |
| `GET` | `/api/dashboard/complaints-by-category` | WARDEN, ADMIN | Complaints breakdown by category |

---

## Role-Based Access Control (RBAC)

1. **STUDENT**:
   - Can register and log in.
   - Can file complaints (`POST /api/complaints`).
   - Can only view complaints they created (`GET /api/complaints`).
   - Cannot view other students' complaints or access the dashboard.
2. **STAFF**:
   - Can log in.
   - Can only view complaints assigned to them.
   - Can update status (`IN_PROGRESS`, `RESOLVED`, etc.) on their assigned complaints.
3. **WARDEN & ADMIN**:
   - Full visibility across all hostels and complaints.
   - Can assign complaints to available staff members.
   - Access to analytics dashboards and summary reports.

---

## Sample Postman / HTTP Requests & JSON Responses

### 1. Health Check
* `GET /api/health`
* **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "server": "running",
    "database": "connected",
    "timestamp": "2026-10-16T10:00:00.000Z"
  }
  ```

### 2. Register Student
* `POST /api/auth/register`
* **Body**:
  ```json
  {
    "fullName": "Aman Verma",
    "email": "aman.verma@example.com",
    "mobile": "9812345678",
    "password": "Password123",
    "role": "STUDENT",
    "rollNumber": "CS202602",
    "course": "B.Tech IT"
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": 5,
        "fullName": "Aman Verma",
        "email": "aman.verma@example.com",
        "role": "STUDENT"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 3. Login
* `POST /api/auth/login`
* **Body**:
  ```json
  {
    "email": "aman.verma@example.com",
    "password": "Password123"
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": 5,
        "fullName": "Aman Verma",
        "email": "aman.verma@example.com",
        "role": "STUDENT"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 4. Create Complaint
* `POST /api/complaints`
* **Header**: `Authorization: Bearer <TOKEN>`
* **Body**:
  ```json
  {
    "roomId": 1,
    "categoryId": 1,
    "title": "Study table light flickers continuously",
    "description": "Tube light near bed 2 flickers and turns off intermittently.",
    "priority": "HIGH"
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "complaint_id": 4,
      "title": "Study table light flickers continuously",
      "description": "Tube light near bed 2 flickers and turns off intermittently.",
      "priority": "HIGH",
      "status": "SUBMITTED",
      "student_name": "Aman Verma",
      "room_number": "101",
      "hostel_name": "Aryabhata Hostel",
      "category_name": "Electrical"
    }
  }
  ```

### 5. Assign Complaint
* `POST /api/complaints/4/assign`
* **Header**: `Authorization: Bearer <WARDEN_TOKEN>`
* **Body**:
  ```json
  {
    "staffId": 1
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "complaint_id": 4,
      "title": "Study table light flickers continuously",
      "status": "ASSIGNED",
      "priority": "HIGH"
    }
  }
  ```

### 6. Dashboard Summary
* `GET /api/dashboard/summary`
* **Header**: `Authorization: Bearer <WARDEN_TOKEN>`
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "totalComplaints": 4,
      "pendingComplaints": 1,
      "resolvedComplaints": 1,
      "totalStaff": 1,
      "totalHostels": 2,
      "totalExpenses": "250.00",
      "feedbackCount": 1,
      "avgRating": "4.00"
    }
  }
  ```

---

## Database Integrity Analysis: Trigger & Stored Procedure Conflict

During schema inspection of `database/triggers.sql` and `database/procedures.sql`, two conflicts were identified:

1. **Trigger `trg_complaint_status_history` Hardcoding**:
   - The trigger defined on `complaints` fires `AFTER UPDATE`:
     ```sql
     INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
     VALUES (NEW.complaint_id, OLD.status, NEW.status, 1, 'Status updated via trigger');
     ```
   - Notice `changed_by` is hardcoded to `1`. Any update done by any warden or staff will attribute status changes to `user_id = 1` in the database history table.

2. **Stored Procedure `AssignComplaint` Double-Insert**:
   - The stored procedure explicitly performs an `INSERT INTO complaint_status_history` AND runs `UPDATE complaints SET status = 'ASSIGNED'`.
   - The subsequent `UPDATE` statement fires `trg_complaint_status_history`, causing **two status history records** for a single assignment.

### Solution Implemented in Backend
- The backend manages assignments cleanly using database transactions in `complaints.repository.ts`, bypassing the double-insert stored procedure.
- Complaint creation inserts the initial history record directly with the real authenticated student ID (the trigger does not fire on `INSERT`).
- For status transitions, the backend performs the update and relies on the trigger to record history without causing duplicates.

### Recommended Permanent SQL Fix
If you wish to update the MySQL trigger in MySQL Workbench to support recording the real authenticated user, replace the trigger with a session variable fallback:
```sql
DROP TRIGGER IF EXISTS trg_complaint_status_history;

DELIMITER $$
CREATE TRIGGER trg_complaint_status_history
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO complaint_status_history (
            complaint_id,
            old_status,
            new_status,
            changed_by,
            remarks
        )
        VALUES (
            NEW.complaint_id,
            OLD.status,
            NEW.status,
            COALESCE(@app_changed_by, 1),
            'Status updated'
        );
    END IF;
END$$
DELIMITER ;
```
