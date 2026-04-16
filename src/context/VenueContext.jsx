import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  INITIAL_GATES, INITIAL_FOOD_STALLS, INITIAL_RESTROOMS,
  INITIAL_SECTIONS, VENUE_INFO, INITIAL_ALERTS,
} from '../data/venueData.js';
import {
  simulateFluctuation, simulateCrowdFluctuation, waitTimeToStatus,
  getBestGate,
} from '../logic/venueLogic.js';

// ─── Initial State ───────────────────────────────────────────
const initialState = {
  venueInfo: VENUE_INFO,
  gates: INITIAL_GATES,
  sections: INITIAL_SECTIONS,
  foodStalls: INITIAL_FOOD_STALLS,
  restrooms: INITIAL_RESTROOMS,
  alerts: INITIAL_ALERTS,
  lastUpdated: new Date().toLocaleTimeString(),
  geminiApiKey: '',
};

// ─── Reducer ─────────────────────────────────────────────────
function venueReducer(state, action) {
  switch (action.type) {
    case 'SIMULATE_UPDATE': {
      // Update gate wait times
      const gates = state.gates.map((g) => {
        const newWait = simulateFluctuation(g.waitTime, 1, 35, 3);
        const newQueue = Math.max(0, g.queueLength + (newWait - g.waitTime) * 10);
        const status = waitTimeToStatus(newWait);
        return { ...g, waitTime: newWait, queueLength: Math.round(newQueue), status };
      });

      // Mark best gate
      const best = getBestGate(gates);
      const updatedGates = gates.map((g) => ({ ...g, isRecommended: g.id === best?.id }));

      // Update food stall wait times
      const foodStalls = state.foodStalls.map((f) => {
        const newWait = simulateFluctuation(f.waitTime, 1, 30, 2);
        const newQueue = Math.max(0, Math.round(newWait * 2.2));
        const status = waitTimeToStatus(newWait);
        return { ...f, waitTime: newWait, queueLength: newQueue, status };
      });

      // Update restrooms
      const restrooms = state.restrooms.map((r) => {
        const newWait = simulateFluctuation(r.waitTime, 1, 25, 2);
        const newQueue = Math.max(0, Math.round(newWait * 1.5));
        const avail = Math.max(1, Math.round(r.totalStalls * (1 - newWait / 25)));
        const status = waitTimeToStatus(newWait);
        return { ...r, waitTime: newWait, queueLength: newQueue, availableStalls: avail, status };
      });

      // Update section crowd levels
      const sections = state.sections.map((s) => ({
        ...s,
        crowdLevel: simulateCrowdFluctuation(s.crowdLevel, 3),
      }));

      return {
        ...state,
        gates: updatedGates,
        foodStalls,
        restrooms,
        sections,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    }

    case 'SET_API_KEY':
      return { ...state, geminiApiKey: action.payload };

    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts.slice(0, 9)] };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────
const VenueContext = createContext(null);

export function VenueProvider({ children }) {
  const [state, dispatch] = useReducer(venueReducer, initialState);

  // Simulate live updates every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'SIMULATE_UPDATE' });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const setApiKey = useCallback((key) => {
    dispatch({ type: 'SET_API_KEY', payload: key });
  }, []);

  return (
    <VenueContext.Provider value={{ ...state, dispatch, setApiKey }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error('useVenue must be used within VenueProvider');
  return ctx;
}
