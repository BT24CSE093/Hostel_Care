import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, User, Mail, Phone, Lock, BookOpen, Wrench, Loader2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Student specific
  const [rollNumber, setRollNumber] = useState<string>('');
  const [course, setCourse] = useState<string>('');

  // Staff specific
  const [staffType, setStaffType] = useState<string>('ELECTRICIAN');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { register, getDefaultRouteForRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile || !password) {
      setError('Please fill in all basic fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'STUDENT' && !rollNumber) {
      setError('Roll number is required for students');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await register({
        fullName,
        email,
        mobile,
        password,
        role,
        rollNumber: role === 'STUDENT' ? rollNumber : undefined,
        course: role === 'STUDENT' ? course : undefined,
        staffType: role === 'STAFF' ? staffType : undefined,
      });

      navigate(getDefaultRouteForRole(res.user.role), { replace: true });
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-2 shadow-md shadow-sky-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create an Account</h2>
          <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">
            HostelCare Maintenance System
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
          {(['STUDENT', 'WARDEN', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                role === r
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10 digit mobile"
                  maxLength={15}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                  placeholder="Min 6 characters"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Student Fields */}
          {role === 'STUDENT' && (
            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Student Academic Details</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. CS2026_101"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Branch</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Staff Fields */}
          {role === 'STAFF' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4" />
                <span>Maintenance Trade Specification</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Specialization</label>
                <select
                  value={staffType}
                  onChange={(e) => setStaffType(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  required
                >
                  <option value="ELECTRICIAN">Electrician</option>
                  <option value="PLUMBER">Plumber</option>
                  <option value="CARPENTER">Carpenter</option>
                  <option value="CLEANER">Cleaner</option>
                  <option value="GENERAL">General Maintenance</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering {role}...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-sky-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
