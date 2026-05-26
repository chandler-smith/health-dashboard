export default function SkeletonCard({ height = 120 }) {
  return (
    <div
      className="card"
      style={{ height, cursor: 'default', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 36, width: '60%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 8, width: '100%', borderRadius: 4 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 24, width: 64, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 24, width: 64, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 24, width: 64, borderRadius: 12 }} />
      </div>
    </div>
  );
}
