import React from 'react';
import { getStatusColor } from '../../logic/venueLogic.js';

export default function StatusBadge({ status, size = 'sm' }) {
  const cls = `badge badge-${status?.toLowerCase() || 'low'}`;
  const dots = { LOW: '●', MODERATE: '●', HIGH: '●' };
  return (
    <span className={cls} aria-label={`Status: ${status}`}>
      {dots[status] || '●'} {status || 'UNKNOWN'}
    </span>
  );
}
