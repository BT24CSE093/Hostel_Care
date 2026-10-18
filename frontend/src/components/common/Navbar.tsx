import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'WARDEN':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'STAFF':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'STUDENT':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-800 tracking-tight">Hostel<span className="text-sky-600">Care</span></span>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest hidden sm:block">Maintenance & Complaint Tracker</p>
            </div>
          </div>

          {/* User profile & actions */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user.fullName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border tracking-wide uppercase ${getRoleBadgeStyle(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <button
                onClick={logout}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
