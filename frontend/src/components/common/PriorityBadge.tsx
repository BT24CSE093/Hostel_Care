import React from 'react';
import { ComplaintPriority } from '../../types';

interface PriorityBadgeProps {
  priority: ComplaintPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeConfig = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBadgeConfig(
        priority
      )}`}
    >
      {priority}
    </span>
  );
};
