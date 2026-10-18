import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await login({ email, password });
      navigate(getDefaultRouteForRole(res.user.role), { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Hostel<span className="text-sky-600">Care</span>
          </h2>
          <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-0.5">
            Maintenance & Complaint Portal
          </p>
        </div>

        {isExpired && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-200">
            Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@hostel.edu"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:underline">
            Register here
          </Link>
        </div>

        {/* Demo Tip */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
          <p className="font-semibold text-slate-500 mb-1">HostelCare DBMS Project</p>
          <p>Register a new account or sign in to test role-specific workflows.</p>
        </div>
      </div>
    </div>
  );
};
