import { useState, useRef } from 'react';
import { Scale, Target, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import { getMostRecentWeight, getPreviousWeight, filterByRange, projectGoalDate, formatChartDate } from '../utils/dataTransform';

const GOAL_WEIGHT = 180;

export default function WeightCard({ healthData }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(30);
  const expandRef = useRef(null);

  const currentWeight = getMostRecentWeight(healthData);
  const prevWeight = getPreviousWeight(healthData);
  const delta = currentWeight !== null && prevWeight !== null ? currentWeight - prevWeight : null;
  const lbsToGoal = currentWeight !== null ? currentWeight - GOAL_WEIGHT : null;
  const projDate = projectGoalDate(healthData, GOAL_WEIGHT);

  const sparkData = filterByRange(healthData.filter(r => r.weight !== null), 7).map(r => ({
    date: formatChartDate(r.date),
    weight: r.weight,
  }));

  const rangeData = filterByRange(healthData.filter(r => r.weight !== null), range).map(r => ({
    date: formatChartDate(r.date),
    weight: r.weight,
  }));

  const startWeight = rangeData.length > 0 ? rangeData[0].weight : null;
  const lbsLost = startWeight !== null && currentWeight !== null ? startWeight - currentWeight : null;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setTimeout(() => {
        expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 340);
    }
  }

  if (currentWeight === null) {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Scale size={14} color="var(--text-muted)" />
          <span className="stat-label">Weight</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No weight logged yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Collapsed header */}
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={14} color="var(--text-muted)" />
            <span className="stat-label">Weight</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {delta !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {delta > 0
                  ? <TrendingUp size={13} color="var(--status-red)" />
                  : <TrendingDown size={13} color="var(--status-green)" />
                }
                <span style={{ fontSize: 12, fontWeight: 600, color: delta > 0 ? 'var(--status-red)' : 'var(--status-green)' }}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)} from last
                </span>
              </div>
            )}
            <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span className="stat-value">{currentWeight.toFixed(1)}</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>lbs</span>
        </div>

        {lbsToGoal !== null && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: sparkData.length > 1 ? 12 : 0 }}>
            {lbsToGoal.toFixed(1)} lbs to goal
          </p>
        )}

        {sparkData.length > 1 && (
          <ResponsiveContainer width="100%" height={48}>
            <LineChart data={sparkData} margin={{ top: 2, right: 2, left: -40, bottom: 0 }}>
              <Line type="monotone" dataKey="weight" stroke="var(--accent-blue-light)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expanded content */}
      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <StatBox icon={<Scale size={14} color="var(--accent-blue-light)" />} label="Current" value={`${currentWeight.toFixed(1)} lbs`} />
            <StatBox icon={<Target size={14} color="var(--accent-purple-light)" />} label="Goal" value={`${GOAL_WEIGHT} lbs`} />
            {startWeight !== null && (
              <StatBox icon={<Scale size={14} color="var(--text-muted)" />} label="Period Start" value={`${startWeight.toFixed(1)} lbs`} />
            )}
            {lbsLost !== null && (
              <StatBox
                icon={lbsLost > 0 ? <TrendingDown size={14} color="var(--status-green)" /> : <TrendingUp size={14} color="var(--status-red)" />}
                label="Change"
                value={`${lbsLost > 0 ? '-' : '+'}${Math.abs(lbsLost).toFixed(1)} lbs`}
                valueColor={lbsLost > 0 ? 'var(--status-green)' : 'var(--status-red)'}
              />
            )}
          </div>

          {projDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 12, marginBottom: 20
            }}>
              <Target size={15} color="var(--accent-purple-light)" />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Projected goal: <strong style={{ color: 'var(--text-primary)' }}>{projDate}</strong>
              </p>
            </div>
          )}

          <p className="stat-label" style={{ marginBottom: 12 }}>Weight Trend</p>
          <TimeRangeSelector value={range} onChange={setRange} />

          {rangeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={rangeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis
                  domain={[Math.min(...rangeData.map(d => d.weight)) - 3, Math.max(...rangeData.map(d => d.weight)) + 3]}
                  tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                />
                <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
                <ReferenceLine y={GOAL_WEIGHT} stroke="var(--accent-purple)" strokeDasharray="4 2" strokeWidth={1} label={{ value: 'Goal', position: 'insideTopRight', fill: 'var(--accent-purple-light)', fontSize: 10 }} />
                <Line type="monotone" dataKey="weight" stroke="var(--accent-blue-light)" strokeWidth={2} dot={{ r: 2, fill: 'var(--accent-blue-light)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
              No weight data for this period
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, valueColor }) {
  return (
    <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: valueColor ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
