import React from 'react';
import { getStatusColor } from '../../constants/statusColors';

const StatusBadge = ({ status, size = 'md', showDot = false }) => {
  const colors = getStatusColor(status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${colors.bg} ${colors.text} ${sizeClasses[size]}
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;