import { useState, useRef } from 'react';
import { Footprints, Dumbbell, Flame, BedDouble, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import ChartWrapper from './ChartWrapper';
import PctBadge from './PctBadge';
import { filterByRange, filterByPeriod, percentChange, formatChartDate } from '../utils/dataTransform';

const STEP_GOAL = 10000;

function periodAvg(rows, key) {
  const valid = rows.filter(r => r[key] > 0);
  return valid.length ? Math.round(valid.reduce((s, r) => s + r[key], 0) / valid.length) : 0;
}

export default function ActivityCard({ healthData }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(7);
  const expandRef = useRef(null);

  // Collapsed: always 7-day
  const { current: curr7, prior: prev7 } = filterByPeriod(healthData, 7);

  const avgSteps7 = periodAvg(curr7, 'steps');
  const stepsPct7 = percentChange(avgSteps7, periodAvg(prev7, 'steps'));
  const totalActiveCal7 = Math.round(curr7.reduce((s, r) => s + r.activeEnergy, 0));
  const avgExercise7 = periodAvg(curr7, 'exerciseTime');

  // Expanded: variable range
  const { current: currR, prior: prevR } = filterByPeriod(healthData, range);

  const avgStepsR = periodAvg(currR, 'steps');
  const stepsPctR = percentChange(avgStepsR, periodAvg(prevR, 'steps'));

  const totalActiveCalR = Math.round(currR.reduce((s, r) => s + r.activeEnergy, 0));
  const totalActiveCalPrevR = Math.round(prevR.reduce((s, r) => s + r.activeEnergy, 0));
  const activeCalPctR = percentChange(totalActiveCalR, totalActiveCalPrevR);

  const totalRestingCalR = Math.round(currR.reduce((s, r) => s + r.restingEnergy, 0));

  const avgExerciseR = periodAvg(currR, 'exerciseTime');
  const exercisePctR = percentChange(avgExerciseR, periodAvg(prevR, 'exerciseTime'));

  // Chart: skip days with zero steps
  const chartData = filterByRange(healthData, range)
    .filter(r => r.steps > 0)
    .map(r => ({ date: formatChartDate(r.date), steps: r.steps }));

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) setTimeout(() => expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 340);
  }

  const stepsDisplay = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || '—');

  return (
    <div className="card">
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Footprints size={14} color="var(--text-muted)" />
            <span className="stat-label">Activity Patterns</span>
          </div>
          <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Avg Steps</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {stepsDisplay(avgSteps7)}
            </div>
            <PctBadge change={stepsPct7} />
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Active Cal</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Flame size={13} color="var(--status-amber)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {totalActiveCal7 > 0 ? totalActiveCal7.toLocaleString() : '—'}
              </span>
            </div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Avg Exercise</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Dumbbell size={13} color="var(--accent-purple-light)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {avgExercise7 > 0 ? `${avgExercise7}m` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />
          <TimeRangeSelector value={range} onChange={setRange} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <MetricBox icon={<Footprints size={14} color="var(--accent-blue-light)" />} label="Avg Daily Steps" value={stepsDisplay(avgStepsR)} badge={<PctBadge change={stepsPctR} />} />
            <MetricBox icon={<Flame size={14} color="var(--status-amber)" />} label="Active Energy" value={totalActiveCalR > 0 ? `${totalActiveCalR.toLocaleString()} kcal` : '—'} badge={<PctBadge change={activeCalPctR} />} />
            <MetricBox icon={<BedDouble size={14} color="var(--text-muted)" />} label="Resting Energy" value={totalRestingCalR > 0 ? `${totalRestingCalR.toLocaleString()} kcal` : '—'} />
            <MetricBox icon={<Dumbbell size={14} color="var(--accent-purple-light)" />} label="Avg Exercise" value={avgExerciseR > 0 ? `${avgExerciseR} min` : '—'} badge={<PctBadge change={exercisePctR} />} />
          </div>

          <p className="stat-label" style={{ marginBottom: 12 }}>Daily Steps</p>
          {chartData.length > 0 ? (
            <ChartWrapper height={160}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
                  <ReferenceLine y={STEP_GOAL} stroke="var(--accent-blue)" strokeDasharray="4 2" strokeWidth={1} />
                  <Bar dataKey="steps" fill="var(--accent-blue-light)" radius={[4, 4, 0, 0]} opacity={0.85} name="Steps" />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
              No activity data for this period
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, badge }) {
  return (
    <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
        {badge}
      </div>
    </div>
  );
}
