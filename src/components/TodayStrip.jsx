import { Flame } from 'lucide-react';
import { getToday, latestCompleteReadiness, formatChartDate } from '../utils/dataTransform';

const TIER_COLORS = {
  PUSH: 'var(--readiness-push)',
  MODERATE: 'var(--readiness-moderate)',
  RECOVER: 'var(--readiness-recover)',
};

function getTier(score) {
  if (score >= 80) return 'PUSH';
  if (score >= 60) return 'MODERATE';
  return 'RECOVER';
}

export default function TodayStrip({ readiness, dailySummary }) {
  const today = getToday();
  const latest = latestCompleteReadiness(readiness);
  if (!latest) return null;

  const isToday = latest.date === today;
  const score = latest.score;
  const tier = getTier(score);
  const tierColor = TIER_COLORS[tier];

  const todaySummary = dailySummary.find(r => r.date === today);
  const todayCalories = todaySummary?.caloriesIn ?? 0;

  return (
    <div style={{
      border: '1px solid var(--border-card)',
      borderRadius: 14,
      padding: '11px 16px',
      background: 'var(--bg-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Readiness score + tier */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{
            fontSize: 22, fontWeight: 700, color: tierColor,
            fontFamily: 'var(--font-display)', lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: tierColor }}>
            {tier}
          </span>
        </div>

        {!isToday && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            as of {formatChartDate(latest.date)}
          </span>
        )}

        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* Calories in progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame size={12} color="var(--accent-purple-light)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {todayCalories > 0 ? `${todayCalories.toLocaleString()} cal` : 'No food logged'}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            color: 'var(--status-amber)',
            background: 'rgba(245,158,11,0.12)',
            padding: '2px 6px', borderRadius: 999,
          }}>
            IN PROGRESS
          </span>
        </div>
      </div>

      {latest.recommendation && (
        <p style={{
          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
          marginTop: 8, paddingTop: 8,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {latest.recommendation}
        </p>
      )}
    </div>
  );
}
