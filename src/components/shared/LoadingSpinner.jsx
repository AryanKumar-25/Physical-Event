import React from 'react';

export default function LoadingSpinner({ size = 24, color = 'var(--accent-blue)' }) {
  return (
    <div role="status" aria-label="Loading" style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid var(--bg-tertiary)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}
