import React from 'react';

const COLORS = {
  LOW: 'var(--status-low)',
  MODERATE: 'var(--status-moderate)',
  HIGH: 'var(--status-high)',
};

export default function ProgressBar({ value, max = 100, status = 'LOW', label, showLabel = true, height = 6 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = COLORS[status] || COLORS.LOW;

  return (
    <div style={{ width: '100%' }}>
      {showLabel && label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{
        height,
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}60`,
        }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
      </div>
    </div>
  );
}
