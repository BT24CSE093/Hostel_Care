import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = (st: string) => {
    switch (st) {
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatText = (st: string) => st.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeConfig(
        status
      )}`}
    >
      {formatText(status)}
    </span>
  );
};
