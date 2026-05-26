import { useState, useRef } from 'react';
import { Footprints, Dumbbell, Flame, BedDouble, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import { getToday, filterByRange, formatChartDate } from '../utils/dataTransform';

const STEP_GOAL = 10000;

function StepRing({ steps, goal = STEP_GOAL, size = 100 }) {
  const pct = Math.min(steps / goal, 1);
  const r = (size - 10) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = pct * circumference;

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-card-elevated)" strokeWidth={7} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--accent-blue-light)"
        strokeWidth={7}
        strokeDasharray={`${arc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 600ms ease' }}
      />
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 16, fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        steps
      </text>
    </svg>
  );
}

export default function ActivityCard({ healthData }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(7);
  const expandRef = useRef(null);

  const today = getToday();
  const todayData = healthData.find(r => r.date === today) ?? healthData[healthData.length - 1] ?? null;

  const steps = todayData?.steps ?? 0;
  const exerciseTime = todayData?.exerciseTime ?? 0;
  const activeEnergy = todayData?.activeEnergy ?? 0;
  const restingEnergy = todayData?.restingEnergy ?? 0;
  const stepPct = Math.min(steps / STEP_GOAL, 1);

  const rangeData = filterByRange(healthData, range).map(r => ({
    date: formatChartDate(r.date),
    steps: r.steps,
  }));

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setTimeout(() => {
        expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 340);
    }
  }

  return (
    <div className="card">
      {/* Collapsed header */}
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Footprints size={14} color="var(--text-muted)" />
            <span className="stat-label">Activity</span>
          </div>
          <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Steps</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              {steps.toLocaleString()}
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${stepPct * 100}%`, background: 'var(--accent-blue-light)' }} />
            </div>
            <div className="stat-label" style={{ marginTop: 3 }}>{Math.round(stepPct * 100)}%</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="stat-label">Exercise</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dumbbell size={14} color="var(--accent-purple-light)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {exerciseTime} min
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="stat-label">Active Cal</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} color="var(--status-amber)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {Math.round(activeEnergy)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <StepRing steps={steps} goal={STEP_GOAL} size={120} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <StatBox icon={<Dumbbell size={14} color="var(--accent-purple-light)" />} label="Exercise Time" value={`${exerciseTime} min`} />
            <StatBox icon={<Flame size={14} color="var(--status-amber)" />} label="Active Energy" value={`${Math.round(activeEnergy)} kcal`} />
            <StatBox icon={<BedDouble size={14} color="var(--text-muted)" />} label="Resting Energy" value={`${Math.round(restingEnergy)} kcal`} />
            <StatBox icon={<Flame size={14} color="var(--text-secondary)" />} label="Total Out" value={`${Math.round(activeEnergy + restingEnergy)} kcal`} />
          </div>

          <p className="stat-label" style={{ marginBottom: 12 }}>Daily Steps</p>
          <TimeRangeSelector value={range} onChange={setRange} />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={rangeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
              <ReferenceLine y={STEP_GOAL} stroke="var(--accent-blue)" strokeDasharray="4 2" strokeWidth={1} />
              <Bar dataKey="steps" fill="var(--accent-blue-light)" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
