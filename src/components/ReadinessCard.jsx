import { useState, useRef } from 'react';
import { HeartPulse, Activity, Heart, Moon, Zap, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import ChartWrapper from './ChartWrapper';
import PctBadge from './PctBadge';
import {
  getToday,
  filterByRange,
  filterByPeriod,
  percentChange,
  formatChartDate,
} from '../utils/dataTransform';

function getReadinessColor(score) {
  if (score >= 80) return 'var(--readiness-push)';
  if (score >= 60) return 'var(--readiness-moderate)';
  return 'var(--readiness-recover)';
}

function getTier(score) {
  if (score >= 80) return 'PUSH';
  if (score >= 60) return 'MODERATE';
  return 'RECOVER';
}

function periodAvg(rows, key) {
  const valid = rows.filter(r => r[key] > 0);
  return valid.length ? valid.reduce((s, r) => s + r[key], 0) / valid.length : 0;
}

export default function ReadinessCard({ readiness }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(7);
  const expandRef = useRef(null);

  const today = getToday();

  // Collapsed: always 7-day
  const { current: curr7, prior: prev7 } = filterByPeriod(readiness, 7);

  const avgScore7 = curr7.length ? Math.round(curr7.reduce((s, r) => s + r.score, 0) / curr7.length) : 0;
  const avgScorePrev7 = prev7.length ? Math.round(prev7.reduce((s, r) => s + r.score, 0) / prev7.length) : 0;
  const scorePct7 = percentChange(avgScore7, avgScorePrev7);

  const avgHrv7 = Math.round(periodAvg(curr7, 'hrv'));
  const avgHrvPrev7 = Math.round(periodAvg(prev7, 'hrv'));
  const hrvPct7 = percentChange(avgHrv7, avgHrvPrev7);

  const avgSleep7Raw = periodAvg(curr7, 'sleep');
  const avgSleep7 = avgSleep7Raw.toFixed(1);
  const sleepPct7 = percentChange(avgSleep7Raw, periodAvg(prev7, 'sleep'));

  // Sparkline data
  const sparkData = filterByRange(readiness, 7).map(r => ({ score: r.score }));

  // Expanded: variable range
  const { current: currR, prior: prevR } = filterByPeriod(readiness, range);

  const avgScoreR = currR.length ? Math.round(currR.reduce((s, r) => s + r.score, 0) / currR.length) : 0;
  const scorePctR = percentChange(avgScoreR, prevR.length ? Math.round(prevR.reduce((s, r) => s + r.score, 0) / prevR.length) : 0);

  const avgHrvR = Math.round(periodAvg(currR, 'hrv'));
  const hrvPctR = percentChange(avgHrvR, Math.round(periodAvg(prevR, 'hrv')));

  const avgRhrR = Math.round(periodAvg(currR, 'rhr'));
  const rhrPctR = percentChange(avgRhrR, Math.round(periodAvg(prevR, 'rhr')));

  const avgSleepRRaw = periodAvg(currR, 'sleep');
  const avgSleepR = avgSleepRRaw.toFixed(1);
  const sleepPctR = percentChange(avgSleepRRaw, periodAvg(prevR, 'sleep'));

  const avgDeepRemRRaw = periodAvg(currR, 'deepRem');
  const avgDeepRemR = avgDeepRemRRaw.toFixed(2);
  const deepRemPctR = percentChange(avgDeepRemRRaw, periodAvg(prevR, 'deepRem'));

  // Best/worst days in the range
  const bestDay = currR.length ? currR.reduce((b, r) => (r.score > b.score ? r : b)) : null;
  const worstDay = currR.length ? currR.reduce((w, r) => (r.score < w.score ? r : w)) : null;
  const showBestWorst = bestDay && worstDay && bestDay.date !== worstDay.date;

  // Chart data
  const chartData = filterByRange(readiness, range).map(r => ({
    date: formatChartDate(r.date),
    score: r.score,
    hrv: r.hrv > 0 ? r.hrv : null,
  }));

  // "What's driving today" — only shown when today's readiness row is fully complete
  const todayRow = readiness.find(r => r.date === today);
  const todayComplete = todayRow && todayRow.score > 0 && todayRow.hrv > 0 && todayRow.rhr > 0 && todayRow.sleep > 0;

  const tier7 = getTier(avgScore7);
  const tierColor7 = getReadinessColor(avgScore7);

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
            <HeartPulse size={14} color="var(--text-muted)" />
            <span className="stat-label">Recovery Overview</span>
          </div>
          <ChevronDown size={16} className={`chevron-icon${open ? ' open' : ''}`} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            {/* Avg readiness */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span className="stat-value" style={{ color: tierColor7 }}>
                {avgScore7 > 0 ? avgScore7 : '—'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: tierColor7 }}>
                {tier7}
              </span>
              <PctBadge change={scorePct7} />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div className="stat-label">HRV avg</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-purple-light)' }}>
                    {avgHrv7 > 0 ? avgHrv7 : '—'}
                  </span>
                  <PctBadge change={hrvPct7} />
                </div>
              </div>
              <div>
                <div className="stat-label">Sleep avg</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-blue-light)' }}>
                    {parseFloat(avgSleep7) > 0 ? `${avgSleep7}h` : '—'}
                  </span>
                  <PctBadge change={sleepPct7} />
                </div>
              </div>
            </div>
          </div>

          {/* Readiness sparkline */}
          {sparkData.length > 1 && (
            <div style={{ width: 72, flexShrink: 0, alignSelf: 'center' }}>
              <ResponsiveContainer width="100%" height={44}>
                <LineChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <Line type="monotone" dataKey="score" stroke="var(--accent-purple-light)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className={`card-expandable${open ? ' open' : ''}`}>
        <div className="card-expandable-inner" ref={expandRef}>
          <div className="card-divider" />
          <TimeRangeSelector value={range} onChange={setRange} />

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <MetricBox icon={<HeartPulse size={13} color="var(--text-muted)" />} label="Avg Readiness" value={avgScoreR > 0 ? String(avgScoreR) : '—'} badge={<PctBadge change={scorePctR} />} />
            <MetricBox icon={<Activity size={13} color="var(--accent-purple-light)" />} label="Avg HRV" value={avgHrvR > 0 ? `${avgHrvR}ms` : '—'} badge={<PctBadge change={hrvPctR} />} />
            <MetricBox icon={<Heart size={13} color="var(--accent-blue-light)" />} label="Avg RHR" value={avgRhrR > 0 ? `${avgRhrR}bpm` : '—'} badge={<PctBadge change={rhrPctR} lowerIsBetter />} />
            <MetricBox icon={<Moon size={13} color="var(--text-secondary)" />} label="Avg Sleep" value={parseFloat(avgSleepR) > 0 ? `${avgSleepR}h` : '—'} badge={<PctBadge change={sleepPctR} />} />
          </div>

          {/* Deep+REM row */}
          {parseFloat(avgDeepRemR) > 0 && (
            <div style={{ background: 'var(--bg-card-elevated)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Moon size={13} color="var(--text-muted)" />
                  <span className="stat-label">Avg Deep + REM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{avgDeepRemR}h</span>
                  <PctBadge change={deepRemPctR} />
                </div>
              </div>
            </div>
          )}

          {/* Best / worst day */}
          {showBestWorst && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div className="stat-label" style={{ marginBottom: 4 }}>Best day</div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--readiness-push)', fontFamily: 'var(--font-display)' }}>
                  {bestDay.score}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatChartDate(bestDay.date)}</div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div className="stat-label" style={{ marginBottom: 4 }}>Worst day</div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--readiness-recover)', fontFamily: 'var(--font-display)' }}>
                  {worstDay.score}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatChartDate(worstDay.date)}</div>
              </div>
            </div>
          )}

          {/* What's driving today — only when fully complete */}
          {todayComplete && (
            <div style={{ marginBottom: 20 }}>
              <p className="stat-label" style={{ marginBottom: 10 }}>What's driving today</p>
              <MetricCompareRow icon={<Activity size={13} />} label="HRV" value={Math.round(todayRow.hrv)} avg={Math.round(todayRow.hrv7dAvg)} unit="ms" lowerIsBetter={false} />
              <MetricCompareRow icon={<Heart size={13} />} label="Resting HR" value={Math.round(todayRow.rhr)} avg={Math.round(todayRow.rhr7dAvg)} unit="bpm" lowerIsBetter />
              <MetricCompareRow icon={<Moon size={13} />} label="Sleep" value={todayRow.sleep.toFixed(1)} avg={todayRow.sleep7dAvg.toFixed(1)} unit="h" lowerIsBetter={false} />
              <MetricCompareRow icon={<Moon size={13} />} label="Deep + REM" value={todayRow.deepRem.toFixed(2)} avg={todayRow.deepRem7dAvg.toFixed(2)} unit="h" lowerIsBetter={false} />

              {todayRow.recommendation && (
                <div style={{
                  padding: '12px 14px', marginTop: 12, borderRadius: 12,
                  background: `${getReadinessColor(todayRow.score)}15`,
                  border: `1px solid ${getReadinessColor(todayRow.score)}30`,
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <Zap size={14} color={getReadinessColor(todayRow.score)} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {todayRow.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          {chartData.length > 0 && (
            <>
              <p className="stat-label" style={{ marginBottom: 12 }}>Readiness Trend</p>
              <ChartWrapper height={140}>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent-purple-light)" strokeWidth={2} dot={false} name="Readiness" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>

              <p className="stat-label" style={{ marginBottom: 12, marginTop: 20 }}>HRV Trend</p>
              <ChartWrapper height={120}>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: 10 }} labelStyle={{ color: 'var(--text-secondary)', fontSize: 11 }} itemStyle={{ color: 'var(--text-primary)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="hrv" stroke="var(--accent-blue-light)" strokeWidth={2} dot={false} connectNulls={false} name="HRV" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
            </>
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

function MetricCompareRow({ icon, label, value, avg, unit, lowerIsBetter }) {
  if (!value) return null;
  const numVal = parseFloat(value);
  const numAvg = parseFloat(avg);
  const improved = lowerIsBetter ? numVal < numAvg : numVal > numAvg;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}{unit}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs {avg}{unit} avg</span>
        <span style={{ fontSize: 13, color: improved ? 'var(--status-green)' : 'var(--status-red)' }}>
          {improved ? '↑' : '↓'}
        </span>
      </div>
    </div>
  );
}
