import { Sparkles } from 'lucide-react';

export default function InsightsCard({ insights }) {
  if (!insights.length) return null;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Sparkles size={14} color="var(--text-muted)" />
        <span className="stat-label">Insights</span>
      </div>
      <div>
        {insights.map((item, i) => (
          <InsightRow key={i} item={item} isLast={i === insights.length - 1} />
        ))}
      </div>
    </div>
  );
}

function InsightRow({ item, isLast }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: '10px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.insight}</div>
        {item.detail && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.detail}</div>
        )}
        {item.sample && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic' }}>
            based on {item.sample}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
        flexShrink: 0, textAlign: 'right',
      }}>
        {item.value}
      </span>
    </div>
  );
}
