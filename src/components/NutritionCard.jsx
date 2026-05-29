import { useState, useRef } from 'react';
import { Flame, Dumbbell, Wheat, Droplets, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import ChartWrapper from './ChartWrapper';
import PctBadge from './PctBadge';
import {
  getToday,
  filterByRange,
  filterByPeriod,
  excludeZeroCalorieDays,
  percentChange,
  formatChartDate,
} from '../utils/dataTransform';

const CALORIE_GOAL = 1900;
const PROTEIN_GOAL = 150;
const CALS_OUT_MAX = 6000;

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function MacroBar({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  if (total === 0) return <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-card-elevated)' }} />;
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;
  return (
    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
      <div style={{ width: `${pPct}%`, background: 'var(--accent-purple)', borderRadius: 4 }} />
      <div style={{ width: `${cPct}%`, background: 'var(--accent-blue)', borderRadius: 4 }} />
      <div style={{ width: `${fPct}%`, background: 'var(--text-muted)', borderRadius: 4 }} />
    </div>
  );
}

export default function NutritionCard({ dailySummary }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(7);
  const expandRef = useRef(null);

  const today = getToday();
  const todayCalories = dailySummary.find(r => r.date === today)?.caloriesIn ?? 0;

  // Collapsed: always 7-day
  const { current: curr7, prior: prev7 } = filterByPeriod(dailySummary, 7);
  const logged7 = excludeZeroCalorieDays(curr7);
  const loggedPrev7 = excludeZeroCalorieDays(prev7);

  const avgCal7 = Math.round(avg(logged7.map(r => r.caloriesIn)));
  const avgProt7 = Math.round(avg(logged7.map(r => r.protein)));
  const avgCarbs7 = avg(logged7.map(r => r.carbs));
  const avgFat7 = avg(logged7.map(r => r.fat));

  const calPct7 = percentChange(avgCal7, Math.round(avg(loggedPrev7.map(r => r.caloriesIn))));
  const protPct7 = percentChange(avgProt7, Math.round(avg(loggedPrev7.map(r => r.protein))));

  // Expanded: variable range
  const { current: currRange, prior: prevRange } = filterByPeriod(dailySummary, range);
  const loggedRange = excludeZeroCalorieDays(currRange);
  const loggedPrevRange = excludeZeroCalorieDays(prevRange);

  const avgCalR = Math.round(avg(loggedRange.map(r => r.caloriesIn)));
  const avgProtR = Math.round(avg(loggedRange.map(r => r.protein)));
  const avgCarbsR = Math.round(avg(loggedRange.map(r => r.carbs)));
  const avgFatR = Math.round(avg(loggedRange.map(r => r.fat)));

  const calPctR = percentChange(avgCalR, Math.round(avg(loggedPrevRange.map(r => r.caloriesIn))));
  const protPctR = percentChange(avgProtR, Math.round(avg(loggedPrevRange.map(r => r.protein))));
  const carbsPctR = percentChange(avgCarbsR, Math.round(avg(loggedPrevRange.map(r => r.carbs))));
  const fatPctR = percentChange(avgFatR, Math.round(avg(loggedPrevRange.map(r => r.fat))));

  const daysLogged = loggedRange.length;
  const totalDays = currRange.length;

  const proteinHitRate = daysLogged > 0
    ? Math.round((loggedRange.filter(r => r.protein >= PROTEIN_GOAL).length / daysLogged) * 100)
    : 0;

  const deficitDays = loggedRange.filter(r => {
    const out = r.caloriesOut > CALS_OUT_MAX ? null : r.caloriesOut;
    return out && out > 0 && r.caloriesIn < out;
  }).length;

  // Chart: skip zero-calorie days entirely (no misleading dips)
  const chartData = filterByRange(dailySummary, range)
    .filter(r => r.caloriesIn > 0)
    .map(r => ({ date: formatChartDate(r.date), cal: r.caloriesIn }));

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) setTimeout(() => expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 340);
  }

  return (
    <div className="card">
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={14} color="var(--accent-purple-light)" />
            <span className="stat-label">Nutrition Overview</span>
          </div>
          <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
        </div>

        {/* Avg calories headline */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span className="stat-value">{avgCal7 > 0 ? avgCal7.toLocaleString() : '—'}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>kcal/day avg</span>
          <PctBadge change={calPct7} />
        </div>

        {/* Avg protein */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-purple-light)' }}>
              {avgProt7 > 0 ? `${avgProt7}g` : '—'}
            </strong> protein avg
          </span>
          <PctBadge change={protPct7} />
        </div>

        <MacroBar protein={avgProt7} carbs={avgCarbs7} fat={avgFat7} />

        {/* Today secondary */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {todayCalories > 0 ? `${todayCalories.toLocaleString()} cal` : 'No food logged'}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            color: 'var(--status-amber)', background: 'rgba(245,158,11,0.12)',
            padding: '2px 6px', borderRadius: 999,
          }}>IN PROGRESS</span>
        </div>
      </div>

      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />
          <TimeRangeSelector value={range} onChange={setRange} />

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <MetricBox icon={<Flame size={13} color="var(--accent-purple-light)" />} label="Avg Calories" value={avgCalR > 0 ? `${avgCalR.toLocaleString()} kcal` : '—'} badge={<PctBadge change={calPctR} />} />
            <MetricBox icon={<Dumbbell size={13} color="var(--accent-purple-light)" />} label="Avg Protein" value={avgProtR > 0 ? `${avgProtR}g` : '—'} badge={<PctBadge change={protPctR} />} />
            <MetricBox icon={<Wheat size={13} color="var(--accent-blue-light)" />} label="Avg Carbs" value={avgCarbsR > 0 ? `${avgCarbsR}g` : '—'} badge={<PctBadge change={carbsPctR} />} />
            <MetricBox icon={<Droplets size={13} color="var(--text-secondary)" />} label="Avg Fat" value={avgFatR > 0 ? `${avgFatR}g` : '—'} badge={<PctBadge change={fatPctR} />} />
          </div>

          {/* Period stats */}
          <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <StatRow label="Days logged" value={`${daysLogged} of ${totalDays} days`} />
            <StatRow label="Protein target hit" value={`${proteinHitRate}%`} />
            <StatRow label="Days in deficit" value={`${deficitDays} of ${daysLogged}`} noBorder />
          </div>

          {/* Macro breakdown */}
          <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <MacroBar protein={avgProtR} carbs={avgCarbsR} fat={avgFatR} />
            {(avgProtR + avgCarbsR + avgFatR) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
                <MacroLegend icon={<Dumbbell size={12} color="var(--accent-purple)" />} label="Protein" value={avgProtR} total={avgProtR + avgCarbsR + avgFatR} color="var(--accent-purple)" />
                <MacroLegend icon={<Wheat size={12} color="var(--accent-blue)" />} label="Carbs" value={avgCarbsR} total={avgProtR + avgCarbsR + avgFatR} color="var(--accent-blue)" />
                <MacroLegend icon={<Droplets size={12} color="var(--text-muted)" />} label="Fat" value={avgFatR} total={avgProtR + avgCarbsR + avgFatR} color="var(--text-muted)" />
              </div>
            )}
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <>
              <p className="stat-label" style={{ marginBottom: 12 }}>Daily Calories (logged days only)</p>
              <ChartWrapper height={160}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }}
                      labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }}
                      itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }}
                    />
                    <ReferenceLine y={CALORIE_GOAL} stroke="var(--accent-purple)" strokeDasharray="4 2" strokeWidth={1} />
                    <Bar dataKey="cal" fill="url(#calGrad)" radius={[4, 4, 0, 0]} name="Calories" />
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-purple-light)" />
                        <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
              No food logged for this period
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

function StatRow({ label, value, noBorder }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0',
      borderBottom: noBorder ? 'none' : '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function MacroLegend({ icon, label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct}%</span>
    </div>
  );
}
