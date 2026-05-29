import { useState, useEffect, useCallback } from 'react';
import { getFoodLog, getHealthData, getDailySummary, getReadiness, getInsights } from '../api/sheets';
import {
  parseFoodLog,
  parseHealthData,
  parseDailySummary,
  parseReadiness,
  parseInsights,
} from '../utils/dataTransform';

const STALE_THRESHOLD = 10 * 60 * 1000;

export function useHealthData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    lastFetched: null,
    healthDataDate: null,
    foodLog: [],
    healthData: [],
    dailySummary: [],
    readiness: [],
    insights: [],
  });

  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [food, health, summary, readiness, insightsRaw] = await Promise.all([
        getFoodLog(),
        getHealthData(),
        getDailySummary(),
        getReadiness(),
        getInsights(),
      ]);

      const latestTimestamp = Math.max(
        food.timestamp,
        health.timestamp,
        summary.timestamp,
        readiness.timestamp,
        insightsRaw.timestamp,
      );

      const parsedHealth = parseHealthData(health.data);
      const healthDataDate = parsedHealth.length
        ? parsedHealth[parsedHealth.length - 1].date
        : null;

      setState({
        loading: false,
        error: null,
        lastFetched: latestTimestamp,
        healthDataDate,
        foodLog: parseFoodLog(food.data),
        healthData: parsedHealth,
        dailySummary: parseDailySummary(summary.data),
        readiness: parseReadiness(readiness.data),
        insights: parseInsights(insightsRaw.data),
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        const age = state.lastFetched ? Date.now() - state.lastFetched : Infinity;
        if (age >= STALE_THRESHOLD) fetchAll();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchAll, state.lastFetched]);

  return { ...state, refetch: fetchAll };
}
