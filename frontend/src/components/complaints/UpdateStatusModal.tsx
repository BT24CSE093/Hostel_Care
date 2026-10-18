import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { complaintsApi } from '../../api/complaints.api';
import { ComplaintStatus } from '../../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface UpdateStatusModalProps {
  complaintId: number | null;
  currentStatus?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allowedStatuses?: ComplaintStatus[];
}

const DEFAULT_STATUSES: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  complaintId,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
  allowedStatuses = DEFAULT_STATUSES,
}) => {
  const [status, setStatus] = useState<string>(currentStatus || 'IN_PROGRESS');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStatus) {
      setStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await complaintsApi.updateStatus(complaintId, {
        status,
        remarks: remarks.trim() || undefined,
      });
      setRemarks('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Complaint Status #${complaintId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            required
          >
            {allowedStatuses.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status Change Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Work started on replacing faulty switch, parts acquired..."
            rows={3}
            maxLength={500}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Status</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
