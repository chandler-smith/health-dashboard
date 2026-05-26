const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="time-range-selector">
      {RANGES.map(r => (
        <button
          key={r.days}
          className={`time-range-btn${value === r.days ? ' active' : ''}`}
          onClick={() => onChange(r.days)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
