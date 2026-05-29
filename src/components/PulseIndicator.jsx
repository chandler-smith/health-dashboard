import { useState } from 'react';
import { getToday, formatChartDate } from '../utils/dataTransform';

function getStatus(healthDataDate) {
  if (!healthDataDate) return 'error';
  if (healthDataDate === getToday()) return 'fresh';
  const d = new Date(healthDataDate + 'T00:00:00');
  const ageHours = (Date.now() - d.getTime()) / 3600000;
  if (ageHours < 36) return 'stale';
  return 'error';
}

function formatHealthDate(healthDataDate) {
  if (!healthDataDate) return 'unknown';
  const today = getToday();
  if (healthDataDate === today) return 'today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (healthDataDate === yStr) return 'yesterday';
  return formatChartDate(healthDataDate);
}

export default function PulseIndicator({ healthDataDate }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = getStatus(healthDataDate);

  const colors = {
    fresh: 'var(--status-green)',
    stale: 'var(--status-amber)',
    error: 'var(--status-red)',
  };

  const animations = {
    fresh: 'pulse 2s infinite',
    stale: 'pulse-slow 3s infinite',
    error: 'none',
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={() => setShowTooltip(v => !v)}
        aria-label="Data sync status"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 72,
            height: 5,
            borderRadius: 999,
            background: colors[status],
            animation: animations[status],
          }}
        />
      </button>

      {showTooltip && (
        <div
          onClick={() => setShowTooltip(false)}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxWidth: 260,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Health data as of {formatHealthDate(healthDataDate)}.
          <br />
          Food logs update when at desktop.
        </div>
      )}
    </div>
  );
}
