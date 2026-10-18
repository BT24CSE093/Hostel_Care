import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboard.api';
import { complaintsApi } from '../api/complaints.api';
import { staffApi } from '../api/staff.api';
import {
  DashboardSummary,
  StatusCount,
  CategoryCount,
  Complaint,
  StaffMember,
  StaffAssignment,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ComplaintDetailModal } from '../components/complaints/ComplaintDetailModal';
import { AssignStaffModal } from '../components/complaints/AssignStaffModal';
import { UpdateStatusModal } from '../components/complaints/UpdateStatusModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Building,
  DollarSign,
  Star,
  RefreshCw,
  Wrench,
  Edit,
  Eye,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active view tab: 'complaints' | 'analytics' | 'staff'
  const [activeTab, setActiveTab] = useState<'complaints' | 'analytics' | 'staff'>('complaints');

  // Dashboard analytics states
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);

  // Complaints states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoadingComplaints, setIsLoadingComplaints] = useState<boolean>(true);

  // Staff directory states
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [viewingStaffAssignments, setViewingStaffAssignments] = useState<{
    staff: StaffMember;
    assignments: StaffAssignment[];
  } | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false);

  // Modal states
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const [sumData, stData, catData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getComplaintsByStatus(),
        dashboardApi.getComplaintsByCategory(),
      ]);
      setSummary(sumData);
      setStatusCounts(stData);
      setCategoryCounts(catData);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setIsLoadingComplaints(true);
      const data = await complaintsApi.getComplaints(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setComplaints(data);
    } catch (err: any) {
      console.error('Failed to load complaints:', err);
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setIsLoadingStaff(true);
      const data = await staffApi.getStaff();
      setStaffList(data);
    } catch (err: any) {
      console.error('Failed to load staff list:', err);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleViewStaffAssignments = async (staff: StaffMember) => {
    try {
      setIsLoadingAssignments(true);
      const assignments = await staffApi.getStaffAssignments(staff.staff_id);
      setViewingStaffAssignments({ staff, assignments });
    } catch (err: any) {
      console.error('Failed to load staff assignments:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    } else if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab, statusFilter]);

  const refreshAll = async () => {
    await fetchDashboardData();
    if (activeTab === 'complaints') await fetchComplaints();
    if (activeTab === 'staff') await fetchStaff();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
            {user?.role} Administrative Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Hostel Management Console</h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <span className="font-semibold text-white">{user?.fullName}</span> ({user?.role})
          </p>
        </div>

        <button
          onClick={refreshAll}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Total</span>
              <FileText className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <p className="text-xl font-black text-slate-800">{summary.totalComplaints}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl font-black text-amber-600">{summary.pendingComplaints}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Resolved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600">{summary.resolvedComplaints}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Staff</span>
              <Users className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-xl font-black text-purple-600">{summary.totalStaff}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Hostels</span>
              <Building className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-xl font-black text-slate-800">{summary.totalHostels}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Expenses</span>
              <DollarSign className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-xl font-black text-rose-600">₹{summary.totalExpenses}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Rating</span>
              <Star className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl font-black text-amber-600">
              {summary.avgRating} <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'complaints'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Complaints Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Analytics & Distribution
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'staff'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Staff Workload Directory
        </button>
      </div>

      {/* ─── TAB 1: COMPLAINTS MANAGEMENT ─────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SUBMITTED', label: 'Submitted' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'ASSIGNED', label: 'Assigned' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'RESOLVED', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                    statusFilter === tab.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Showing {complaints.length} complaints
            </span>
          </div>

          {isLoadingComplaints ? (
            <LoadingSpinner message="Loading hostel complaints..." />
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-200">
              {error}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No complaints match this filter"
              description="Complaints will appear here when submitted by hostel residents."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Title & Description</th>
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-5 py-3.5">Hostel & Room</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => {
                      const canAssign = ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status);
                      return (
                        <tr key={c.complaint_id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3.5 font-bold text-slate-400 text-xs">
                            #{c.complaint_id}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-800 line-clamp-1">{c.title}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                            {c.student_name || `Student #${c.student_id}`}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600">
                            {c.room_number
                              ? `${c.hostel_name || 'Hostel'} - Room ${c.room_number}`
                              : `${c.hostel_name || 'Campus Facility'} (General)`}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600">
                            {c.category_name || 'General'}
                          </td>
                          <td className="px-5 py-3.5">
                            <PriorityBadge priority={c.priority} />
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {canAssign && (
                              <button
                                onClick={() => setAssigningComplaint(c)}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
                                title="Assign Staff"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Assign</span>
                              </button>
                            )}

                            <button
                              onClick={() => setUpdatingComplaint(c)}
                              className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition"
                              title="Update Status"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Status</span>
                            </button>

                            <button
                              onClick={() => setSelectedComplaintId(c.complaint_id)}
                              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
                              title="Audit Trail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: ANALYTICS & DISTRIBUTION ───────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complaints by Status */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Complaints by Status</h3>
            {statusCounts.length === 0 ? (
              <p className="text-xs text-slate-400">No status distribution data yet.</p>
            ) : (
              <div className="space-y-3">
                {statusCounts.map((item) => {
                  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.status.replace(/_/g, ' ')}</span>
                        <span className="text-slate-900 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complaints by Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Complaints by Category</h3>
            {categoryCounts.length === 0 ? (
              <p className="text-xs text-slate-400">No category breakdown data yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryCounts.map((item) => {
                  const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.category_name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.category_name}</span>
                        <span className="text-slate-900 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: STAFF DIRECTORY & WORKLOAD ─────────────────────── */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {isLoadingStaff ? (
            <LoadingSpinner message="Loading staff directory..." />
          ) : staffList.length === 0 ? (
            <EmptyState title="No staff members registered" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <div
                  key={staff.staff_id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {staff.staff_type}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          staff.availability === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {staff.availability}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-800">{staff.full_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{staff.email || 'No email registered'}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleViewStaffAssignments(staff)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>View Assigned Tasks</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Staff Modal */}
      <AssignStaffModal
        isOpen={assigningComplaint !== null}
        complaintId={assigningComplaint?.complaint_id || null}
        complaintTitle={assigningComplaint?.title}
        onClose={() => setAssigningComplaint(null)}
        onSuccess={() => {
          fetchComplaints();
          fetchDashboardData();
        }}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={updatingComplaint !== null}
        complaintId={updatingComplaint?.complaint_id || null}
        currentStatus={updatingComplaint?.status}
        onClose={() => setUpdatingComplaint(null)}
        onSuccess={() => {
          fetchComplaints();
          fetchDashboardData();
        }}
      />

      {/* Complaint Detail & History Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={selectedComplaintId !== null}
        onClose={() => setSelectedComplaintId(null)}
      />

      {/* Staff Assignments Modal */}
      <Modal
        isOpen={viewingStaffAssignments !== null}
        onClose={() => setViewingStaffAssignments(null)}
        title={`Assigned Complaints: ${viewingStaffAssignments?.staff.full_name}`}
        maxWidth="lg"
      >
        {isLoadingAssignments ? (
          <LoadingSpinner message="Loading workload assignments..." />
        ) : viewingStaffAssignments?.assignments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No tasks assigned currently.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {viewingStaffAssignments?.assignments.map((task) => (
              <div
                key={task.assignment_id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>
                    #{task.complaint_id} — {task.complaint_title}
                  </span>
                  <StatusBadge status={task.complaint_status} />
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Assigned: {new Date(task.assigned_at).toLocaleDateString()}</span>
                  <span className="uppercase text-[10px] font-bold text-slate-500">
                    Status: {task.assignment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
