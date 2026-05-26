import { useState, useRef } from 'react';
import { Flame, Dumbbell, Wheat, Droplets, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import ChartWrapper from './ChartWrapper';
import { getToday, filterByRange, formatChartDate } from '../utils/dataTransform';

const CALORIE_GOAL = 1900;
const PROTEIN_GOAL = 150;

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

function StatPill({ color, label }) {
  return (
    <span className="pill" style={{ background: `${color}18`, color }}>
      {label}
    </span>
  );
}

export default function NutritionCard({ dailySummary, healthData }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(7);
  const expandRef = useRef(null);

  const today = getToday();
  const todaySummary = dailySummary.find(r => r.date === today) ?? null;

  const calories = todaySummary?.caloriesIn ?? 0;
  const protein = todaySummary?.protein ?? 0;
  const carbs = todaySummary?.carbs ?? 0;
  const fat = todaySummary?.fat ?? 0;
  const caloriesOut = todaySummary?.caloriesOut ?? 0;
  const net = calories - caloriesOut;
  const isDeficit = net < 0;

  const rangeData = filterByRange(dailySummary, range).map(r => ({
    date: formatChartDate(r.date),
    cal: r.caloriesIn,
  }));

  const thisWeek = filterByRange(dailySummary, 7);
  const lastWeek = filterByRange(dailySummary, 14).filter(r => !filterByRange(dailySummary, 7).find(w => w.date === r.date));
  const avgThis = thisWeek.length ? Math.round(thisWeek.reduce((s, r) => s + r.caloriesIn, 0) / thisWeek.length) : 0;
  const avgLast = lastWeek.length ? Math.round(lastWeek.reduce((s, r) => s + r.caloriesIn, 0) / lastWeek.length) : 0;

  const todayActiveEnergy = healthData.find(r => r.date === today)?.activeEnergy ?? 0;
  const todayRestingEnergy = healthData.find(r => r.date === today)?.restingEnergy ?? 0;

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
      {/* Collapsed header — tap to toggle */}
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span className="stat-label">{today}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={14} color="var(--accent-purple-light)" />
            <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <span className="stat-value">{calories.toLocaleString()}</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {CALORIE_GOAL.toLocaleString()} kcal</span>
        </div>

        <MacroBar protein={protein} carbs={carbs} fat={fat} />

        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <StatPill color="var(--accent-purple-light)" label={`${protein}g P`} />
          <StatPill color="var(--accent-blue-light)" label={`${carbs}g C`} />
          <StatPill color="var(--text-secondary)" label={`${fat}g F`} />
        </div>

        {caloriesOut > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isDeficit
              ? <TrendingDown size={14} color="var(--status-green)" />
              : <TrendingUp size={14} color="var(--status-red)" />
            }
            <span style={{ fontSize: 13, color: isDeficit ? 'var(--status-green)' : 'var(--status-red)', fontWeight: 600 }}>
              {isDeficit ? 'Deficit' : 'Surplus'} {Math.abs(net).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <MetricBox icon={<Flame size={14} color="var(--accent-purple-light)" />} label="Calories In" value={`${calories.toLocaleString()} kcal`} />
            <MetricBox icon={<Flame size={14} color="var(--text-muted)" />} label="Calories Out" value={`${caloriesOut.toLocaleString()} kcal`} />
            <MetricBox icon={<Flame size={14} color="var(--accent-purple)" />} label="Active Cal" value={`${Math.round(todayActiveEnergy).toLocaleString()} kcal`} />
            <MetricBox icon={<Flame size={14} color="var(--text-muted)" />} label="Resting Cal" value={`${Math.round(todayRestingEnergy).toLocaleString()} kcal`} />
          </div>

          <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <MacroRow icon={<Dumbbell size={14} color="var(--accent-purple-light)" />} label="Protein" value={protein} goal={PROTEIN_GOAL} color="var(--accent-purple)" />
            <MacroRow icon={<Wheat size={14} color="var(--accent-blue-light)" />} label="Carbs" value={carbs} color="var(--accent-blue)" />
            <MacroRow icon={<Droplets size={14} color="var(--text-secondary)" />} label="Fat" value={fat} color="var(--text-muted)" />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
            background: isDeficit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isDeficit ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 12, marginBottom: 20,
          }}>
            {isDeficit ? <TrendingDown size={15} color="var(--status-green)" /> : <TrendingUp size={15} color="var(--status-red)" />}
            <span style={{ fontSize: 13, fontWeight: 600, color: isDeficit ? 'var(--status-green)' : 'var(--status-red)' }}>
              {isDeficit ? 'Deficit' : 'Surplus'} {Math.abs(net).toLocaleString()} kcal today
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              This week avg: <strong style={{ color: 'var(--text-primary)' }}>{avgThis}</strong>
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Last week: <strong style={{ color: 'var(--text-primary)' }}>{avgLast}</strong>
            </span>
          </div>

          <p className="stat-label" style={{ marginBottom: 12 }}>Daily Calories</p>
          <TimeRangeSelector value={range} onChange={setRange} />
          <ChartWrapper height={160}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={rangeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }}
                  itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }}
                />
                <ReferenceLine y={CALORIE_GOAL} stroke="var(--accent-purple)" strokeDasharray="4 2" strokeWidth={1} />
                <Bar dataKey="cal" fill="url(#calGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-purple-light)" />
                    <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value }) {
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

function MacroRow({ icon, label, value, goal, color }) {
  const pct = goal ? Math.min((value / goal) * 100, 100) : null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {value}g{goal ? ` / ${goal}g` : ''}
        </span>
      </div>
      {pct !== null && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}
