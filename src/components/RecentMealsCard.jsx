import { UtensilsCrossed } from 'lucide-react';
import { getToday } from '../utils/dataTransform';

const MEAL_COLORS = {
  breakfast: 'var(--status-amber)',
  lunch: 'var(--accent-blue-light)',
  dinner: 'var(--accent-purple-light)',
  snack: 'var(--text-secondary)',
};

function mealColor(label) {
  return MEAL_COLORS[label.toLowerCase()] ?? 'var(--text-muted)';
}

export default function RecentMealsCard({ foodLog }) {
  const recent = [...foodLog]
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    })
    .slice(0, 7);

  return (
    <div className="card" style={{ cursor: 'default' }} onClick={undefined}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UtensilsCrossed size={14} color="var(--text-muted)" />
          <span className="stat-label">Recent Meals</span>
        </div>
      </div>

      {recent.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
          No meals logged
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recent.map((meal, i) => (
            <MealRow key={i} meal={meal} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View all — coming soon</span>
      </div>
    </div>
  );
}

function MealRow({ meal }) {
  const color = mealColor(meal.mealLabel);
  const today = getToday();
  const isToday = meal.date === today;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span
        className="pill"
        style={{
          background: `${color}18`,
          color,
          fontSize: 10,
          minWidth: 64,
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {meal.mealLabel}
      </span>
      <span style={{
        flex: 1,
        fontSize: 13,
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {meal.description}
      </span>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {meal.calories}
        </div>
        {!isToday && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{meal.date.slice(5)}</div>
        )}
      </div>
    </div>
  );
}
