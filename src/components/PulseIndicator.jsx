import { useState } from 'react';

function getStatus(lastFetched) {
  if (!lastFetched) return 'error';
  const ageMs = Date.now() - lastFetched;
  const ageHr = ageMs / 3600000;
  if (ageHr < 2) return 'fresh';
  if (ageHr < 12) return 'stale';
  return 'error';
}

function formatAge(lastFetched) {
  if (!lastFetched) return 'Never';
  const ageMs = Date.now() - lastFetched;
  const ageMin = Math.floor(ageMs / 60000);
  if (ageMin < 1) return 'Just now';
  if (ageMin < 60) return `${ageMin}m ago`;
  const ageHr = Math.floor(ageMin / 60);
  return `${ageHr}h ago`;
}

export default function PulseIndicator({ lastFetched }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = getStatus(lastFetched);

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
            padding: '8px 12px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          Last synced: {formatAge(lastFetched)}
        </div>
      )}
    </div>
  );
}
