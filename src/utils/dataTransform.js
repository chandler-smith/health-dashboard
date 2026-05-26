// Normalize any date string to YYYY-MM-DD.
// Handles: "M/D/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "M/D/YY"
function normalizeDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw; // already canonical
  const parts = raw.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw;
}

// Format a YYYY-MM-DD date for chart labels: "May 26"
export function formatChartDate(isoDate) {
  if (!isoDate) return '';
  const [, m, d] = isoDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// Food Log: Date | Time | Meal Label | Description | Calories | Protein | Carbs | Fat
export function parseFoodLog(rows) {
  if (!rows) return [];
  return rows.map(r => ({
    date: normalizeDate(r[0]),
    time: r[1] ?? '',
    mealLabel: r[2] ?? '',
    description: r[3] ?? '',
    calories: parseFloat(r[4]) || 0,
    protein: parseFloat(r[5]) || 0,
    carbs: parseFloat(r[6]) || 0,
    fat: parseFloat(r[7]) || 0,
  })).filter(r => r.date);
}

// Health Data: Date | Active Energy | Exercise Time | Resting Energy | Steps | Weight | HRV | RHR | Sleep Total | Sleep Deep | Sleep REM | Sleep Core | Sleep Awake
export function parseHealthData(rows) {
  if (!rows) return [];
  return rows.map(r => ({
    date: normalizeDate(r[0]),
    activeEnergy: parseFloat(r[1]) || 0,
    exerciseTime: parseFloat(r[2]) || 0,
    restingEnergy: parseFloat(r[3]) || 0,
    steps: parseFloat(r[4]) || 0,
    weight: r[5] ? parseFloat(r[5]) : null,
    hrv: parseFloat(r[6]) || 0,
    rhr: parseFloat(r[7]) || 0,
    sleepTotal: parseFloat(r[8]) || 0,
    sleepDeep: parseFloat(r[9]) || 0,
    sleepRem: parseFloat(r[10]) || 0,
    sleepCore: parseFloat(r[11]) || 0,
    sleepAwake: parseFloat(r[12]) || 0,
  })).filter(r => r.date);
}

// Daily Summary: Date | Calories In | Protein | Carbs | Fat | Calories Out | Net Calories | Weight | Status
export function parseDailySummary(rows) {
  if (!rows) return [];
  return rows.map(r => ({
    date: normalizeDate(r[0]),
    caloriesIn: parseFloat(r[1]) || 0,
    protein: parseFloat(r[2]) || 0,
    carbs: parseFloat(r[3]) || 0,
    fat: parseFloat(r[4]) || 0,
    caloriesOut: parseFloat(r[5]) || 0,
    netCalories: parseFloat(r[6]) || 0,
    weight: r[7] ? parseFloat(r[7]) : null,
    status: r[8] ?? '',
  })).filter(r => r.date);
}

// Readiness: Date | HRV | HRV 7d Avg | RHR | RHR 7d Avg | Sleep | Sleep 7d Avg | Deep+REM | Deep+REM 7d Avg | Score | Recommendation
export function parseReadiness(rows) {
  if (!rows) return [];
  return rows.map(r => ({
    date: normalizeDate(r[0]),
    hrv: parseFloat(r[1]) || 0,
    hrv7dAvg: parseFloat(r[2]) || 0,
    rhr: parseFloat(r[3]) || 0,
    rhr7dAvg: parseFloat(r[4]) || 0,
    sleep: parseFloat(r[5]) || 0,
    sleep7dAvg: parseFloat(r[6]) || 0,
    deepRem: parseFloat(r[7]) || 0,
    deepRem7dAvg: parseFloat(r[8]) || 0,
    score: parseFloat(r[9]) || 0,
    recommendation: r[10] ?? '',
  })).filter(r => r.date && r.score > 0);
}

export function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMostRecentWeight(healthData) {
  for (let i = healthData.length - 1; i >= 0; i--) {
    if (healthData[i].weight !== null) return healthData[i].weight;
  }
  return null;
}

export function getPreviousWeight(healthData) {
  let found = 0;
  for (let i = healthData.length - 1; i >= 0; i--) {
    if (healthData[i].weight !== null) {
      found++;
      if (found === 2) return healthData[i].weight;
    }
  }
  return null;
}

export function filterByRange(data, days) {
  if (!days) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  return data.filter(r => r.date >= cutoffStr);
}

export function projectGoalDate(healthData, goalWeight) {
  const withWeight = healthData.filter(r => r.weight !== null).slice(-30);
  if (withWeight.length < 2) return null;
  const first = withWeight[0];
  const last = withWeight[withWeight.length - 1];
  const daysDiff = (new Date(last.date) - new Date(first.date)) / 86400000;
  if (daysDiff === 0) return null;
  const ratePerDay = (last.weight - first.weight) / daysDiff;
  if (ratePerDay >= 0) return null;
  const daysToGoal = (goalWeight - last.weight) / ratePerDay;
  const target = new Date(last.date);
  target.setDate(target.getDate() + Math.round(daysToGoal));
  return target.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
