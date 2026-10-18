import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-800">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mt-2">
        The requested screen does not exist or you do not have permission to view it.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};
