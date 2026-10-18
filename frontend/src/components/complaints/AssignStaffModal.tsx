import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { staffApi } from '../../api/staff.api';
import { complaintsApi } from '../../api/complaints.api';
import { StaffMember } from '../../types';
import { Loader2, AlertCircle, Wrench } from 'lucide-react';

interface AssignStaffModalProps {
  complaintId: number | null;
  complaintTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  complaintId,
  complaintTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await staffApi.getStaff();
        setStaffList(data);
        const available = data.find((s) => s.availability === 'AVAILABLE');
        if (available) {
          setSelectedStaffId(available.staff_id);
        } else if (data.length > 0) {
          setSelectedStaffId(data[0].staff_id);
        }
      } catch (err: any) {
        console.error('Failed to load staff list:', err);
        setError(err.response?.data?.message || 'Failed to load staff list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId || !selectedStaffId) {
      setError('Please select a staff member');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await complaintsApi.assignComplaint(complaintId, { staffId: Number(selectedStaffId) });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to assign staff:', err);
      setError(err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={complaintTitle ? `Assign Staff: ${complaintTitle}` : 'Assign Staff Member'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading active staff members...</div>
        ) : staffList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No active staff members found.</div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Maintenance Staff
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {staffList.map((staff) => {
                const isSelected = selectedStaffId === staff.staff_id;
                const isAvailable = staff.availability === 'AVAILABLE';
                return (
                  <label
                    key={staff.staff_id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="staffRadio"
                        value={staff.staff_id}
                        checked={isSelected}
                        onChange={() => setSelectedStaffId(staff.staff_id)}
                        className="text-sky-600 focus:ring-sky-500 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 flex items-center space-x-1.5">
                          <span>{staff.full_name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {staff.staff_type}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">{staff.email || 'No email'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {staff.availability}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

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
            disabled={isSubmitting || !selectedStaffId}
            className="flex items-center space-x-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
