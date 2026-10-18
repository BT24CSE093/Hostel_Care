# HostelCare — Frontend Application

This is the React + TypeScript + Vite frontend for **HostelCare**, connecting to the Express + MySQL backend.

---

## Features Implemented

- **Authentication & RBAC**:
  - Registration and login with JWT stored in `localStorage`.
  - Role-specific dashboards for **STUDENT**, **WARDEN**, **ADMIN**, and **STAFF**.
  - Route guards (`ProtectedRoute`, `RoleGuard`) to enforce access boundaries.
  - Automatic session expiry redirection on 401 Unauthorized responses.
- **Student Dashboard**:
  - Quick KPI stats: Total complaints, Pending, In Progress, Resolved.
  - Filter complaints by status.
  - "File New Complaint" modal with dynamic hostel, room, and category dropdowns.
  - "View Details" modal with complaint information and complete audit history trail.
- **Warden & Admin Dashboard**:
  - Live KPI metric cards: Total complaints, Pending, Resolved, Active staff, Total hostels, Total maintenance expenses, and Feedback rating.
  - Interactive distribution charts: Complaints by Status & Complaints by Category.
  - Complaint management table with staff assignment modal and status transition modal.
  - Staff workload directory with assigned tasks inspection.
- **Staff Workstation Dashboard**:
  - Filter and view assigned maintenance complaints.
  - Fast status progress updates (`IN_PROGRESS`, `RESOLVED`) with remarks.
  - Complaint history inspection.

---

## Tech Stack

- **Framework**: React 18 & TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT request & 401 response interceptors

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Ensure `.env` exists in `frontend/` (configured by default):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in `frontend/dist/`.
