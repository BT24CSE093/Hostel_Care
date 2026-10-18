import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsApi } from '../api/complaints.api';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ComplaintDetailModal } from '../components/complaints/ComplaintDetailModal';
import { UpdateStatusModal } from '../components/complaints/UpdateStatusModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Wrench,
  Clock,
  CheckCircle2,
  RefreshCw,
  Home,
  Tag,
  Eye,
  Edit,
  AlertCircle,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);

  const fetchAssignedComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await complaintsApi.getComplaints(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setComplaints(data);
    } catch (err: any) {
      console.error('Failed to load assigned complaints:', err);
      setError(err.response?.data?.message || 'Failed to fetch assigned complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, [statusFilter]);

  const assignedCount = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300">
            Maintenance Technician Workstation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Hello, {user?.fullName}</h1>
          <p className="text-xs text-teal-100 mt-1">
            Trade: <span className="font-semibold uppercase">{user?.profile?.staff_type || 'General Technician'}</span> • Status: <span className="font-semibold">{user?.profile?.availability || 'Available'}</span>
          </p>
        </div>

        <button
          onClick={fetchAssignedComplaints}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs font-bold bg-teal-700/60 hover:bg-teal-700 text-teal-100 px-4 py-2.5 rounded-xl border border-teal-500/40 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Newly Assigned</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{assignedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Work In Progress</span>
            <Wrench className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600">{inProgressCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Completed Work</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-fit">
        {[
          { id: 'ALL', label: 'All Tasks' },
          { id: 'ASSIGNED', label: 'Assigned' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          { id: 'RESOLVED', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              statusFilter === tab.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <LoadingSpinner message="Fetching your assigned work orders..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-200">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No tasks assigned right now"
          description="When wardens assign maintenance tickets to you, they will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
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
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setUpdatingComplaint(c)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Update Progress</span>
                      </button>

                      <button
                        onClick={() => setSelectedComplaintId(c.complaint_id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={selectedComplaintId !== null}
        onClose={() => setSelectedComplaintId(null)}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={updatingComplaint !== null}
        complaintId={updatingComplaint?.complaint_id || null}
        currentStatus={updatingComplaint?.status}
        allowedStatuses={['IN_PROGRESS', 'RESOLVED']}
        onClose={() => setUpdatingComplaint(null)}
        onSuccess={fetchAssignedComplaints}
      />
    </div>
  );
};
