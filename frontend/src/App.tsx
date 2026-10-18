import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { RoleGuard } from './components/routes/RoleGuard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

const RootRedirect: React.FC = () => {
  const { user, getDefaultRouteForRole, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Student Dashboard */}
              <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
                <Route path="/student" element={<StudentDashboard />} />
              </Route>

              {/* Warden and Admin Dashboard */}
              <Route element={<RoleGuard allowedRoles={['WARDEN', 'ADMIN']} />}>
                <Route path="/warden" element={<WardenDashboard />} />
                <Route path="/admin" element={<WardenDashboard />} />
              </Route>

              {/* Staff Dashboard */}
              <Route element={<RoleGuard allowedRoles={['STAFF']} />}>
                <Route path="/staff" element={<StaffDashboard />} />
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
