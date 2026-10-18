# HostelCare — Manual Test Plan & API Verification Guide

This test plan provides complete instructions, curl commands, and expected results to verify every API endpoint, role-based access control rule, database transaction, and trigger behavior.

---

## Prerequisites

1. MySQL server running with `hostelcare_db` populated.
2. A `.env` file created in `backend/` with correct credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hostelcare_db
   JWT_SECRET=super_secret_hostelcare_jwt_key_2026
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```
3. Start the server:
   ```bash
   cd backend
   npm run dev
   ```

---

## Test Scenarios

### 1. Database Connectivity & Health Check
* **Endpoint**: `GET /api/health`
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/health
  ```
* **Expected Output** (Status `200 OK` when DB is connected):
  ```json
  {
    "status": "ok",
    "server": "running",
    "database": "connected",
    "timestamp": "2026-10-16T10:00:00.000Z"
  }
  ```
* **Failure Scenario** (Status `503 Service Unavailable` if MySQL is stopped):
  ```json
  {
    "status": "error",
    "server": "running",
    "database": "disconnected"
  }
  ```

---

### 2. User Registration (Student & Staff)

#### 2.1 Register New Student
* **Endpoint**: `POST /api/auth/register`
* **Command**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Rahul Sharma",
      "email": "rahul.student@test.com",
      "mobile": "9876543210",
      "password": "Password@123",
      "role": "STUDENT",
      "rollNumber": "CS202601",
      "course": "B.Tech CSE"
    }'
  ```
* **Expected Output** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": 5,
        "fullName": "Rahul Sharma",
        "email": "rahul.student@test.com",
        "role": "STUDENT"
      },
      "token": "<JWT_STUDENT_TOKEN>"
    }
  }
  ```

#### 2.2 Duplicate Registration Check (Email/Mobile/Roll Number)
* Re-running the command above should return `409 Conflict`:
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

### 3. Authentication (Login & JWT Verification)

> **Note on Demo Users**: The initial seed data in `hostelcare_backup.sql` has `password_hash = 'DEMO_HASH'` for demo users (not real bcrypt hashes). To log in as WARDEN or ADMIN, register a new warden/admin user or update their password hash using bcrypt.

#### 3.1 Login Success
* **Endpoint**: `POST /api/auth/login`
* **Command**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "rahul.student@test.com",
      "password": "Password@123"
    }'
  ```
* **Expected Output** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": 5,
        "fullName": "Rahul Sharma",
        "email": "rahul.student@test.com",
        "role": "STUDENT"
      },
      "token": "<JWT_STUDENT_TOKEN>"
    }
  }
  ```

#### 3.2 Login Failure (Wrong Password)
* **Command**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "rahul.student@test.com",
      "password": "WrongPassword"
    }'
  ```
* **Expected Output** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

#### 3.3 Get Current Profile (`GET /api/auth/me`)
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer <JWT_STUDENT_TOKEN>"
  ```
* **Expected Output** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "userId": 5,
      "fullName": "Rahul Sharma",
      "email": "rahul.student@test.com",
      "mobile": "9876543210",
      "role": "STUDENT",
      "isActive": 1,
      "profile": {
        "student_id": 2,
        "user_id": 5,
        "roll_number": "CS202601",
        "course": "B.Tech CSE"
      }
    }
  }
  ```

---

### 4. Unauthorized & Forbidden API Requests

#### 4.1 Missing Token
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/complaints
  ```
* **Expected Output** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Authentication required. Provide a Bearer token."
  }
  ```

#### 4.2 Role Forbidden (Student accessing Admin Dashboard)
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/dashboard/summary \
    -H "Authorization: Bearer <JWT_STUDENT_TOKEN>"
  ```
* **Expected Output** (`403 Forbidden`):
  ```json
  {
    "success": false,
    "message": "You do not have permission to access this resource."
  }
  ```

---

### 5. Hostels, Rooms, and Categories

#### 5.1 List Hostels
* **Endpoint**: `GET /api/hostels`
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/hostels
  ```
* **Expected Output** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      { "hostel_id": 1, "hostel_name": "Aryabhata Hostel", "location": "North Campus" },
      { "hostel_id": 2, "hostel_name": "Bhaskara Hostel", "location": "South Campus" }
    ]
  }
  ```

#### 5.2 List Rooms for a Hostel
* **Endpoint**: `GET /api/hostels/1/rooms`
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/hostels/1/rooms
  ```
* **Expected Output** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      { "room_id": 1, "hostel_id": 1, "room_number": "101", "capacity": 2 },
      { "room_id": 2, "hostel_id": 1, "room_number": "102", "capacity": 2 }
    ]
  }
  ```

#### 5.3 List Complaint Categories
* **Endpoint**: `GET /api/complaint-categories`
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/complaint-categories
  ```
* **Expected Output** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      { "category_id": 1, "category_name": "Electrical", "description": "Fan, light, socket issues", "default_priority": "HIGH" },
      { "category_id": 2, "category_name": "Plumbing", "description": "Tap, leakage, drainage issues", "default_priority": "MEDIUM" }
    ]
  }
  ```

---

### 6. Complaints Management & Permissions

#### 6.1 Create Complaint (Student Only)
* **Endpoint**: `POST /api/complaints`
* **Command**:
  ```bash
  curl -X POST http://localhost:5000/api/complaints \
    -H "Authorization: Bearer <JWT_STUDENT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "roomId": 1,
      "categoryId": 1,
      "title": "Ceiling fan making vibrating noise",
      "description": "The ceiling fan regulator and motor vibrate loudly at speed 3 and above.",
      "priority": "MEDIUM"
    }'
  ```
* **Expected Output** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "complaint_id": 4,
      "title": "Ceiling fan making vibrating noise",
      "description": "The ceiling fan regulator and motor vibrate loudly at speed 3 and above.",
      "priority": "MEDIUM",
      "status": "SUBMITTED",
      "student_name": "Rahul Sharma",
      "room_number": "101",
      "hostel_name": "Aryabhata Hostel",
      "category_name": "Electrical"
    }
  }
  ```

#### 6.2 Role-Based Complaints Listing
* **Student Token**: Only returns complaints submitted by that student.
* **Staff Token**: Only returns complaints assigned to that staff member.
* **Warden/Admin Token**: Returns all complaints across all hostels.

#### 6.3 Complaint Details & History
* **Endpoint**: `GET /api/complaints/4`
* **Command**:
  ```bash
  curl -X GET http://localhost:5000/api/complaints/4 \
    -H "Authorization: Bearer <JWT_STUDENT_TOKEN>"
  ```
* **Expected Output**:
  Contains complaint details plus `statusHistory` array tracing all transitions.

#### 6.4 Assign Complaint (Warden / Admin)
* **Endpoint**: `POST /api/complaints/4/assign`
* **Command**:
  ```bash
  curl -X POST http://localhost:5000/api/complaints/4/assign \
    -H "Authorization: Bearer <JWT_WARDEN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{ "staffId": 1 }'
  ```
* **Expected Output** (`200 OK`):
  Complaint status transitions to `ASSIGNED`, and an active assignment is created for staff member 1.

#### 6.5 Update Complaint Status
* **Endpoint**: `PATCH /api/complaints/4/status`
* **Command**:
  ```bash
  curl -X PATCH http://localhost:5000/api/complaints/4/status \
    -H "Authorization: Bearer <JWT_WARDEN_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "IN_PROGRESS",
      "remarks": "Electrician arrived on site and started inspection"
    }'
  ```
* **Expected Output** (`200 OK`):
  Updated complaint record with status `IN_PROGRESS`.

---

### 7. Staff & Assignments

* `GET /api/staff` (Warden/Admin): Returns list of active staff members and their availability.
* `GET /api/staff/1/assignments` (Warden/Admin/Staff): Returns all active and past complaint assignments for staff member 1.

---

### 8. Dashboard Analytics (Warden & Admin)

* `GET /api/dashboard/summary`
* `GET /api/dashboard/complaints-by-status`
* `GET /api/dashboard/complaints-by-category`

All aggregate queries return structured JSON metrics for charts and summary counters.
