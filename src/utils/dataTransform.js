// Normalize any date string to YYYY-MM-DD.
// Handles: "M/D/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "M/D/YY"
function normalizeDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parts = raw.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw;
}

function dateObjToISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Format a YYYY-MM-DD date for chart labels: "May 26"
export function formatChartDate(isoDate) {
  if (!isoDate) return '';
  const [, m, d] = isoDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

export function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
    weight: r[5] ? (parseFloat(r[5]) || null) : null,
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

// Insights: Insight | Value | Detail | Sample
export function parseInsights(rows) {
  if (!rows) return [];
  return rows.map(r => ({
    insight: r[0] ?? '',
    value: r[1] ?? '',
    detail: r[2] ?? '',
    sample: r[3] ?? '',
  })).filter(r => r.insight);
}

// Last `days` days, INCLUDING today (for charts)
export function filterByRange(data, days) {
  if (!days) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = dateObjToISO(cutoff);
  return data.filter(r => r.date >= cutoffStr);
}

// Current period = last `days` complete days (excluding today).
// Prior period = the `days` days immediately before that.
// Used for period comparisons.
export function filterByPeriod(data, days) {
  const today = getToday();
  const currStart = new Date(today + 'T00:00:00');
  currStart.setDate(currStart.getDate() - days);
  const currStartStr = dateObjToISO(currStart);

  const prevStart = new Date(currStartStr + 'T00:00:00');
  prevStart.setDate(prevStart.getDate() - days);
  const prevStartStr = dateObjToISO(prevStart);

  const current = data.filter(r => r.date >= currStartStr && r.date < today);
  const prior = data.filter(r => r.date >= prevStartStr && r.date < currStartStr);
  return { current, prior };
}

// Exclude days where Calories In = 0 (logging gaps, not real fasts)
export function excludeZeroCalorieDays(rows) {
  return rows.filter(r => r.caloriesIn > 0);
}

// Returns { value: rounded %, direction: 'up' | 'down' | 'flat' } or null
export function percentChange(current, previous) {
  if (previous == null || previous === 0 || current == null) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const rounded = Math.round(pct);
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat';
  return { value: rounded, direction };
}

// Most recent readiness row where score, hrv, rhr, and sleep are all non-zero (fully synced)
export function latestCompleteReadiness(rows) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (r.score > 0 && r.hrv > 0 && r.rhr > 0 && r.sleep > 0) return r;
  }
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].score > 0) return rows[i];
  }
  return null;
}

// Filter an array of numbers, dropping values above `max` (for calories-out outlier guard)
export function excludeOutliers(values, max) {
  return values.filter(v => v <= max);
}

// Remove single-day weight spikes: a reading more than 5 lbs from both neighbors is a misentry
export function filterWeightOutliers(data) {
  if (data.length < 3) return data;
  return data.filter((row, i, arr) => {
    if (i === 0 || i === arr.length - 1) return true;
    const diff1 = Math.abs(row.weight - arr[i - 1].weight);
    const diff2 = Math.abs(row.weight - arr[i + 1].weight);
    return !(diff1 >= 5 && diff2 >= 5);
  });
}

export function getMostRecentWeight(healthData) {
  for (let i = healthData.length - 1; i >= 0; i--) {
    const w = healthData[i].weight;
    if (w !== null && w > 0) return w;
  }
  return null;
}

export function getPreviousWeight(healthData) {
  let found = 0;
  for (let i = healthData.length - 1; i >= 0; i--) {
    const w = healthData[i].weight;
    if (w !== null && w > 0) {
      found++;
      if (found === 2) return w;
    }
  }
  return null;
}

export function projectGoalDate(data, goalWeight) {
  const withWeight = data.filter(r => r.weight !== null && r.weight > 0).slice(-30);
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
