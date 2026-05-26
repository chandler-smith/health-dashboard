import { useState, useEffect, useCallback } from 'react';
import { getFoodLog, getHealthData, getDailySummary, getReadiness } from '../api/sheets';
import {
  parseFoodLog,
  parseHealthData,
  parseDailySummary,
  parseReadiness,
} from '../utils/dataTransform';

const STALE_THRESHOLD = 30 * 60 * 1000;

export function useHealthData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    lastFetched: null,
    foodLog: [],
    healthData: [],
    dailySummary: [],
    readiness: [],
  });

  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [food, health, summary, readiness] = await Promise.all([
        getFoodLog(),
        getHealthData(),
        getDailySummary(),
        getReadiness(),
      ]);

      const latestTimestamp = Math.max(
        food.timestamp,
        health.timestamp,
        summary.timestamp,
        readiness.timestamp
      );

      setState({
        loading: false,
        error: null,
        lastFetched: latestTimestamp,
        foodLog: parseFoodLog(food.data),
        healthData: parseHealthData(health.data),
        dailySummary: parseDailySummary(summary.data),
        readiness: parseReadiness(readiness.data),
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

  // Re-fetch on tab visibility if cache is stale
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
