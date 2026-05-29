import { useState, useRef } from 'react';
import { Scale, Target, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import ChartWrapper from './ChartWrapper';
import { filterByRange, filterWeightOutliers, projectGoalDate, formatChartDate } from '../utils/dataTransform';

const GOAL_WEIGHT = 180;
const START_WEIGHT = 215.6;

function ratePerWeek(points) {
  if (points.length < 2) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const days = (new Date(last.date) - new Date(first.date)) / 86400000;
  if (days < 3) return null;
  return ((last.weight - first.weight) / days) * 7;
}

export default function WeightCard({ healthData }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(30);
  const expandRef = useRef(null);

  const allWeightData = healthData
    .filter(r => r.weight !== null && r.weight > 0)
    .map(r => ({ date: r.date, weight: r.weight }));

  const cleanData = filterWeightOutliers(allWeightData);
  const currentWeight = cleanData.length ? cleanData[cleanData.length - 1].weight : null;

  const totalChange = currentWeight !== null ? currentWeight - START_WEIGHT : null;
  const last30 = filterByRange(cleanData, 30);
  const weeklyRate = ratePerWeek(last30);
  const projDate = projectGoalDate(cleanData, GOAL_WEIGHT);

  const rangePoints = filterByRange(cleanData, range);
  const rangeData = rangePoints.map(r => ({ date: formatChartDate(r.date), weight: r.weight }));
  const periodStart = rangeData.length > 0 ? rangeData[0].weight : null;
  const periodChange = periodStart !== null && currentWeight !== null ? currentWeight - periodStart : null;

  const yMin = rangeData.length
    ? Math.min(...rangeData.map(d => d.weight), GOAL_WEIGHT) - 2
    : GOAL_WEIGHT - 5;
  const yMax = rangeData.length
    ? Math.max(...rangeData.map(d => d.weight)) + 2
    : START_WEIGHT + 5;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) setTimeout(() => expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 340);
  }

  if (currentWeight === null) {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Scale size={14} color="var(--text-muted)" />
          <span className="stat-label">Body Composition</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No weight logged yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={14} color="var(--text-muted)" />
            <span className="stat-label">Body Composition</span>
          </div>
          <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
        </div>

        {/* Current weight + total change */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span className="stat-value">{currentWeight.toFixed(1)}</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>lbs</span>
          {totalChange !== null && (
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: totalChange <= 0 ? 'var(--status-green)' : 'var(--status-red)',
            }}>
              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} from start
            </span>
          )}
        </div>

        {/* Rate + lbs to goal */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {weeklyRate !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {weeklyRate <= 0
                ? <TrendingDown size={13} color="var(--status-green)" />
                : <TrendingUp size={13} color="var(--status-red)" />
              }
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{Math.abs(weeklyRate).toFixed(2)} lbs</strong>/wk
              </span>
            </div>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-purple-light)' }}>
              {(currentWeight - GOAL_WEIGHT).toFixed(1)}
            </strong> lbs to goal
          </span>
        </div>
      </div>

      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />
          <TimeRangeSelector value={range} onChange={setRange} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <StatBox icon={<Scale size={14} color="var(--text-muted)" />} label="Start" value={`${START_WEIGHT} lbs`} />
            <StatBox icon={<Scale size={14} color="var(--accent-blue-light)" />} label="Current" value={`${currentWeight.toFixed(1)} lbs`} />
            <StatBox icon={<Target size={14} color="var(--accent-purple-light)" />} label="Goal" value={`${GOAL_WEIGHT} lbs`} />
            {weeklyRate !== null && (
              <StatBox
                icon={weeklyRate <= 0 ? <TrendingDown size={14} color="var(--status-green)" /> : <TrendingUp size={14} color="var(--status-red)" />}
                label="Avg rate"
                value={`${Math.abs(weeklyRate).toFixed(2)} lbs/wk`}
                valueColor={weeklyRate <= 0 ? 'var(--status-green)' : 'var(--status-red)'}
              />
            )}
            {periodChange !== null && (
              <StatBox
                icon={periodChange <= 0 ? <TrendingDown size={14} color="var(--status-green)" /> : <TrendingUp size={14} color="var(--status-red)" />}
                label="Period change"
                value={`${periodChange > 0 ? '+' : ''}${periodChange.toFixed(1)} lbs`}
                valueColor={periodChange <= 0 ? 'var(--status-green)' : 'var(--status-red)'}
              />
            )}
          </div>

          {projDate ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 12, marginBottom: 20,
            }}>
              <Target size={15} color="var(--accent-purple-light)" />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Projected goal: <strong style={{ color: 'var(--text-primary)' }}>{projDate}</strong>
              </p>
            </div>
          ) : (
            <div style={{
              padding: '10px 14px', background: 'var(--bg-card-elevated)',
              borderRadius: 12, marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No clear downward trend yet</p>
            </div>
          )}

          <p className="stat-label" style={{ marginBottom: 12 }}>Weight Trend</p>
          {rangeData.length > 0 ? (
            <ChartWrapper height={180}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={rangeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
                  <ReferenceLine y={GOAL_WEIGHT} stroke="var(--accent-purple)" strokeDasharray="4 2" strokeWidth={1} label={{ value: 'Goal', position: 'insideTopRight', fill: 'var(--accent-purple-light)', fontSize: 10 }} />
                  <Line type="monotone" dataKey="weight" stroke="var(--accent-blue-light)" strokeWidth={2} dot={{ r: 2, fill: 'var(--accent-blue-light)' }} name="Weight" />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
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
