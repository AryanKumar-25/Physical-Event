import React from 'react';

export default function WaitTimeBadge({ minutes }) {
  let color, bg, border, label;
  if (minutes <= 5) {
    color = 'var(--status-low)'; bg = 'var(--status-low-dim)';
    border = 'rgba(16,185,129,0.3)'; label = '🟢';
  } else if (minutes <= 12) {
    color = 'var(--status-moderate)'; bg = 'var(--status-moderate-dim)';
    border = 'rgba(245,158,11,0.3)'; label = '🟡';
  } else {
    color = 'var(--status-high)'; bg = 'var(--status-high-dim)';
    border = 'rgba(239,68,68,0.3)'; label = '🔴';
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: bg, color, border: `1px solid ${border}`,
      fontSize: 'var(--text-xs)', fontWeight: 700,
    }}
    aria-label={`Wait time: ${minutes} minutes`}
    >
      {label} {minutes} min
    </span>
  );
}
