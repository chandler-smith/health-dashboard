const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const API_KEY = import.meta.env.VITE_SHEETS_API_KEY;
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const CACHE_DURATION = 10 * 60 * 1000;

const cache = {};

async function fetchRange(range) {
  const now = Date.now();
  if (cache[range] && now - cache[range].timestamp < CACHE_DURATION) {
    return { data: cache[range].data, timestamp: cache[range].timestamp };
  }
  const url = `${BASE_URL}/${encodeURIComponent(range)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`);
  const json = await res.json();
  const timestamp = now;
  cache[range] = { data: json.values ?? [], timestamp };
  return { data: json.values ?? [], timestamp };
}

export async function getFoodLog() {
  return fetchRange('Food Log!A2:H500');
}

export async function getHealthData() {
  return fetchRange('Health Data!A2:M500');
}

export async function getDailySummary() {
  return fetchRange('Daily Summary!A2:I200');
}

export async function getReadiness() {
  return fetchRange('Readiness!A2:K200');
}

export async function getInsights() {
  return fetchRange('Insights!A2:D50');
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}
