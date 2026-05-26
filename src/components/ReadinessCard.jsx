import { useState, useRef } from 'react';
import { HeartPulse, Activity, Heart, Moon, TrendingUp, TrendingDown, Zap, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import { getToday, filterByRange, formatChartDate } from '../utils/dataTransform';

function getReadinessColor(score) {
  if (score >= 80) return 'var(--readiness-push)';
  if (score >= 60) return 'var(--readiness-moderate)';
  return 'var(--readiness-recover)';
}

function getCardBorderColor(score) {
  if (score >= 80) return 'rgba(34,197,94,0.25)';
  if (score >= 60) return 'rgba(245,158,11,0.25)';
  if (score > 0) return 'rgba(239,68,68,0.25)';
  return 'var(--border-card)';
}

function getRecommendationTier(score) {
  if (score >= 80) return 'PUSH';
  if (score >= 60) return 'MODERATE';
  return 'RECOVER';
}

function ScoreArc({ score, size = 96 }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = (score / 100) * circumference;
  const color = getReadinessColor(score);

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-purple)" />
          <stop offset="100%" stopColor="var(--accent-blue)" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-card-elevated)" strokeWidth={8} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={score >= 60 ? 'url(#scoreGrad)' : color}
        strokeWidth={8}
        strokeDasharray={`${arc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 600ms ease' }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 24, fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        {score}
      </text>
    </svg>
  );
}

function MetricCompareRow({ icon, label, value, avg, unit, lowerIsBetter }) {
  if (!value) return null;
  const improved = lowerIsBetter ? value < avg : value > avg;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}{unit}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs {avg}{unit} avg</span>
        {improved
          ? <TrendingUp size={14} color="var(--status-green)" />
          : <TrendingDown size={14} color="var(--status-red)" />
        }
      </div>
    </div>
  );
}

export default function ReadinessCard({ readiness }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(30);
  const expandRef = useRef(null);

  const today = getToday();
  const todayData = readiness.find(r => r.date === today) ?? readiness[readiness.length - 1] ?? null;
  const score = todayData?.score ?? 0;
  const tier = getRecommendationTier(score);
  const tierColor = getReadinessColor(score);

  const rangeData = filterByRange(readiness, range).map(r => ({
    date: formatChartDate(r.date),
    score: r.score,
    hrv: r.hrv,
  }));

  const tierBg = { PUSH: 'rgba(34,197,94,0.1)', MODERATE: 'rgba(245,158,11,0.1)', RECOVER: 'rgba(239,68,68,0.1)' };
  const tierBorder = { PUSH: 'rgba(34,197,94,0.2)', MODERATE: 'rgba(245,158,11,0.2)', RECOVER: 'rgba(239,68,68,0.2)' };
  const tierMessages = {
    PUSH: "You're recovered. Push hard in training today. Good window for match-intensity work and PR attempts.",
    MODERATE: "Train but don't max out. Technical work over match intensity. Skip PR attempts in the gym.",
    RECOVER: "Prioritize recovery. Light movement only. No high-intensity training today.",
  };

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
    <div className="card" style={{ borderColor: getCardBorderColor(score) }}>
      {/* Collapsed header */}
      <div className="card-header" onClick={toggle}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <ScoreArc score={score} size={96} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartPulse size={14} color="var(--text-muted)" />
                <span className="stat-label">Readiness</span>
              </div>
              <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: tierColor, marginBottom: 12 }}>
              {tier}
            </div>
            {todayData && (
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-label">HRV</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-purple-light)', marginTop: 2 }}>{Math.round(todayData.hrv)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-label">RHR</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-blue-light)', marginTop: 2 }}>{Math.round(todayData.rhr)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-label">Sleep</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{todayData.sleep.toFixed(1)}h</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />

          {todayData && (
            <div style={{ marginBottom: 20 }}>
              <MetricCompareRow icon={<Activity size={14} />} label="HRV" value={Math.round(todayData.hrv)} avg={Math.round(todayData.hrv7dAvg)} unit="ms" lowerIsBetter={false} />
              <MetricCompareRow icon={<Heart size={14} />} label="Resting HR" value={Math.round(todayData.rhr)} avg={Math.round(todayData.rhr7dAvg)} unit="bpm" lowerIsBetter={true} />
              <MetricCompareRow icon={<Moon size={14} />} label="Sleep" value={todayData.sleep.toFixed(1)} avg={todayData.sleep7dAvg.toFixed(1)} unit="h" lowerIsBetter={false} />
              <MetricCompareRow icon={<Moon size={14} />} label="Deep + REM" value={todayData.deepRem.toFixed(2)} avg={todayData.deepRem7dAvg.toFixed(2)} unit="h" lowerIsBetter={false} />
            </div>
          )}

          <div style={{
            padding: '14px 16px',
            background: tierBg[tier],
            border: `1px solid ${tierBorder[tier]}`,
            borderRadius: 14, marginBottom: 24,
            display: 'flex', gap: 10, alignItems: 'flex-start'
          }}>
            <Zap size={16} color={tierColor} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: tierColor }}>{tier}:</strong> {tierMessages[tier]}
            </p>
          </div>

          <p className="stat-label" style={{ marginBottom: 12 }}>Readiness Trend</p>
          <TimeRangeSelector value={range} onChange={setRange} />
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={rangeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent-purple-light)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <p className="stat-label" style={{ marginBottom: 12, marginTop: 20 }}>HRV Trend</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={rangeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
              <Line type="monotone" dataKey="hrv" stroke="var(--accent-blue-light)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
