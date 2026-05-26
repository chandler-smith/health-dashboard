import './index.css';
import { useHealthData } from './hooks/useHealthData';
import PulseIndicator from './components/PulseIndicator';
import NutritionCard from './components/NutritionCard';
import ReadinessCard from './components/ReadinessCard';
import ActivityCard from './components/ActivityCard';
import WeightCard from './components/WeightCard';
import RecentMealsCard from './components/RecentMealsCard';
import SkeletonCard from './components/SkeletonCard';

const CARD_HEIGHTS = [140, 130, 120, 130, 200];

export default function App() {
  const { loading, error, lastFetched, foodLog, healthData, dailySummary, readiness, refetch } = useHealthData();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        padding: '0 16px 48px',
        position: 'relative',
      }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-primary)',
        }}>
          <h1 style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            Chandler Health
          </h1>
          <PulseIndicator lastFetched={lastFetched} />
        </header>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--status-red)' }}>Failed to load data</span>
            <button
              onClick={refetch}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: 'none',
                color: 'var(--status-red)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            CARD_HEIGHTS.map((h, i) => (
              <div key={i} style={{ animation: `cardIn 400ms ease ${i * 60}ms both` }}>
                <SkeletonCard height={h} />
              </div>
            ))
          ) : (
            <>
              <AnimatedCard delay={0}>
                <NutritionCard dailySummary={dailySummary} healthData={healthData} />
              </AnimatedCard>
              <AnimatedCard delay={60}>
                <ReadinessCard readiness={readiness} />
              </AnimatedCard>
              <AnimatedCard delay={120}>
                <ActivityCard healthData={healthData} />
              </AnimatedCard>
              <AnimatedCard delay={180}>
                <WeightCard healthData={healthData} />
              </AnimatedCard>
              <AnimatedCard delay={240}>
                <RecentMealsCard foodLog={foodLog} />
              </AnimatedCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnimatedCard({ delay, children }) {
  return (
    <div style={{ animation: `cardIn 400ms ease ${delay}ms both` }}>
      {children}
    </div>
  );
}
