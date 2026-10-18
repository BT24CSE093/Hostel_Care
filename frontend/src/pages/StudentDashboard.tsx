import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi } from '../api/complaints.api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CreateComplaintModal } from '../components/complaints/CreateComplaintModal';
import { ComplaintDetailModal } from '../components/complaints/ComplaintDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  PlusCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Home,
  Tag,
  Eye,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await complaintsApi.getComplaints(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setComplaints(data);
    } catch (err: any) {
      console.error('Failed to load student complaints:', err);
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  // Derived counts for KPI cards
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) =>
    ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)
  ).length;
  const inProgressCount = complaints.filter((c) =>
    ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) =>
    ['RESOLVED', 'CLOSED'].includes(c.status)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-600/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-200">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Welcome, {user?.fullName}</h1>
          <p className="text-xs text-sky-100 mt-1">
            Roll No: <span className="font-semibold">{user?.profile?.roll_number || 'N/A'}</span> • Course:{' '}
            <span className="font-semibold">{user?.profile?.course || 'General'}</span>
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2 bg-white hover:bg-sky-50 text-sky-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-sky-600" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Filed
            </span>
            <FileText className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{totalCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <AlertCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{inProgressCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter and action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { id: 'ALL', label: 'All Complaints' },
            { id: 'SUBMITTED', label: 'Submitted' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                statusFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchComplaints}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Complaints List / Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading your complaints..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-200">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="You haven't submitted any maintenance requests matching this filter yet."
          actionText="File New Complaint"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Complaint</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{c.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {c.room_number
                            ? `${c.hostel_name || 'Hostel'} - Room ${c.room_number}`
                            : `${c.hostel_name || 'Campus Facility'} (General)`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.category_name || 'General'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedComplaintId(c.complaint_id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Complaint Modal */}
      <CreateComplaintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchComplaints}
      />

      {/* Complaint Details Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={selectedComplaintId !== null}
        onClose={() => setSelectedComplaintId(null)}
      />
    </div>
  );
};
