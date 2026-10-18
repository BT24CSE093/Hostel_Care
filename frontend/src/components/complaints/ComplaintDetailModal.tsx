import React, { useEffect, useState } from 'react';
import { Complaint } from '../../types';
import { complaintsApi } from '../../api/complaints.api';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Calendar, User, Home, Tag, Clock, ArrowRight } from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  isOpen,
  onClose,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId || !isOpen) {
      setComplaint(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await complaintsApi.getComplaint(complaintId);
        setComplaint(data);
      } catch (err: any) {
        console.error('Failed to load complaint details:', err);
        setError(err.response?.data?.message || 'Could not load complaint details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [complaintId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={complaint ? `Complaint #${complaint.complaint_id}: ${complaint.title}` : 'Complaint Details'}
      maxWidth="2xl"
    >
      {isLoading && <LoadingSpinner message="Fetching complaint & history..." />}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200 mb-4">
          {error}
        </div>
      )}

      {complaint && !isLoading && (
        <div className="space-y-6">
          {/* Status & Priority header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Priority:</span>
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2.5 text-slate-600">
              <Home className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400">Location / Room</p>
                <p className="font-semibold text-slate-800">
                  {complaint.room_number
                    ? `${complaint.hostel_name || 'Hostel'} — Room ${complaint.room_number}`
                    : `${complaint.hostel_name || 'Campus Facility'} (Location-independent)`}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-slate-600">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400">Category</p>
                <p className="font-semibold text-slate-800">{complaint.category_name || 'General'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-slate-600">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400">Submitted By</p>
                <p className="font-semibold text-slate-800">{complaint.student_name || 'Student'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400">Created At</p>
                <p className="font-semibold text-slate-800">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Status History Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Status History Audit Trail</span>
            </h4>

            {(!complaint.statusHistory || complaint.statusHistory.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No transition history logged yet.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
                {complaint.statusHistory.map((item, idx) => (
                  <div key={item.history_id || idx} className="relative pl-6">
                    {/* Circle marker */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-sky-600" />
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-700">
                        {item.old_status && (
                          <>
                            <span className="text-slate-500">{item.old_status}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                        <span className="text-sky-700 font-bold">{item.new_status}</span>
                        <span className="text-slate-400 font-normal ml-auto">
                          {new Date(item.changed_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        Changed by: <span className="font-medium text-slate-700">{item.changer_name || `User #${item.changed_by}`}</span>
                      </p>
                      {item.remarks && (
                        <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                          "{item.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
