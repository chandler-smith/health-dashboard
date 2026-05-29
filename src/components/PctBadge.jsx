export default function PctBadge({ change, lowerIsBetter = false }) {
  if (!change) return null;
  const { value, direction } = change;
  const isGood = lowerIsBetter ? direction === 'down' : direction === 'up';
  const color = direction === 'flat'
    ? 'var(--text-muted)'
    : isGood ? 'var(--status-green)' : 'var(--status-red)';
  const prefix = direction === 'up' ? '+' : '';
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color,
      background: `${color}18`,
      padding: '2px 6px', borderRadius: 999,
      flexShrink: 0,
    }}>
      {prefix}{value}%
    </span>
  );
}
