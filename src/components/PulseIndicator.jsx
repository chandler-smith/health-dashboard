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
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowTooltip(v => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 44,
          minHeight: 44,
        }}
        aria-label="Data sync status"
      >
        <span
          style={{
            display: 'block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors[status],
            animation: animations[status],
          }}
        />
      </button>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
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
          onClick={() => setShowTooltip(false)}
        >
          Last synced: {formatAge(lastFetched)}
        </div>
      )}
    </div>
  );
}
