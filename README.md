# HostelCare — Hostel Maintenance & Complaint Tracking System

A full-stack hostel maintenance and complaint tracking management application designed with a **MySQL** relational database, **Node.js + Express + TypeScript** modular backend, and a modern **React + TypeScript + Vite + Tailwind CSS** frontend.

---

## 🌟 Key Features

- **Multi-Role Access Control (RBAC)**: Dedicated workflows and dashboards for **STUDENT**, **WARDEN**, **STAFF**, and **ADMIN**.
- **Comprehensive Complaint Categories**:
  - **Hostel Room Maintenance**: Electrical, Plumbing, Cleaning, Furniture (requires room number 1–1056).
  - **Campus Facilities & Amenities**: Mess, Sports, Network.
  - **LAN & Network Intelligence**: Wi-Fi/campus complaints are location-independent, whereas **LAN connectivity / Ethernet issues** enforce room number entry (1–1056).
- **Automated Room Resolution**: Direct room entry (1 to 1056) dynamically resolves against the hostel room registry and maintains compatibility with historical records.
- **Workflow & Lifecycle Tracking**: Complaints transition across `SUBMITTED`, `UNDER_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, and `REJECTED` with audit trails and assignment tracking.
- **Interactive Dashboards**: Role-tailored dashboards with metrics, recent complaint feeds, filterable tables, and category analytics.

---

## 📂 Project Architecture

```text
Hostel_Care/
├── backend/               # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/        # MySQL2 connection pool
│   │   ├── middleware/    # Auth (JWT), Validation (Zod), Centralized Error Handling
│   │   └── modules/       # Modular features: auth, complaints, hostels, staff, dashboard
│   ├── tests/             # Automated Jest unit tests & integration scripts
│   ├── .env.example       # Template for backend environment variables
│   └── package.json
│
├── frontend/              # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/           # Axios HTTP client & API service modules
│   │   ├── components/    # Reusable UI components & modals
│   │   ├── context/       # Auth context & state management
│   │   ├── pages/         # Role-specific dashboard views & complaint management
│   │   └── types/         # TypeScript interfaces & types
│   └── package.json
│
├── database/              # MySQL schema, views, triggers, and migrations
│   ├── hostelcare_backup.sql
│   ├── 001_add_categories_and_room_handling.sql
│   └── ...
│
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Database Setup
1. Ensure MySQL 8+ is running locally on port 3306.
2. Import the database backup from `database/hostelcare_backup.sql`:
   ```bash
   mysql -u root -p < database/hostelcare_backup.sql
   ```
3. Run any incremental migrations in `database/`.

### 2. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=hostelcare_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

- **Backend Unit Tests**:
  ```bash
  cd backend
  npm test
  ```
- **Complaint & Migration Verification**:
  ```bash
  cd backend
  node tests/verify_complaint_extensions.js
  ```
- **Frontend Build Verification**:
  ```bash
  cd frontend
  npm run build
  ```
