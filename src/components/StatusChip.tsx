import React from 'react';
import { JobStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { cn } from '../lib/utils';

interface StatusChipProps {
  status: JobStatus;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className }) => {
  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-medium border',
        STATUS_COLORS[status],
        className
      )}
    >
      {status}
    </span>
  );
};
