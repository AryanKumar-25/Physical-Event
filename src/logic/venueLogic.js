// ============================================================
// STADIUMIQ — Smart Venue Logic
// All recommendation algorithms & decision logic
// ============================================================

/**
 * Returns the gate with the lowest wait time
 */
export function getBestGate(gates) {
  if (!gates || gates.length === 0) return null;
  return gates.reduce((best, gate) =>
    gate.waitTime < best.waitTime ? gate : best
  );
}

/**
 * Returns top N gates sorted by wait time (ascending)
 */
export function getRankedGates(gates, n = 3) {
  if (!gates) return [];
  return [...gates].sort((a, b) => a.waitTime - b.waitTime).slice(0, n);
}

/**
 * Returns the best restroom given an optional zone preference
 */
export function getBestRestroom(restrooms, zone = null) {
  if (!restrooms || restrooms.length === 0) return null;
  let candidates = restrooms;
  if (zone) {
    const zoneFiltered = restrooms.filter((r) => r.zone === zone);
    if (zoneFiltered.length > 0) candidates = zoneFiltered;
  }
  return candidates.reduce((best, r) =>
    r.waitTime < best.waitTime ? r : best
  );
}

/**
 * Returns restrooms sorted by wait time, optionally filtered by zone
 */
export function getRankedRestrooms(restrooms, zone = null, n = 3) {
  if (!restrooms) return [];
  let candidates = zone
    ? restrooms.filter((r) => r.zone === zone)
    : restrooms;
  if (candidates.length === 0) candidates = restrooms;
  return [...candidates].sort((a, b) => a.waitTime - b.waitTime).slice(0, n);
}

/**
 * Returns the least crowded food stall, optionally by category or zone
 */
export function getBestFoodStall(stalls, category = null, zone = null) {
  if (!stalls || stalls.length === 0) return null;
  let candidates = stalls;
  if (category) {
    const catFiltered = stalls.filter((s) =>
      s.category.toLowerCase().includes(category.toLowerCase())
    );
    if (catFiltered.length > 0) candidates = catFiltered;
  }
  if (zone) {
    const zoneFiltered = candidates.filter((s) => s.zone === zone);
    if (zoneFiltered.length > 0) candidates = zoneFiltered;
  }
  return candidates.reduce((best, s) =>
    s.waitTime < best.waitTime ? s : best
  );
}

/**
 * Returns food stalls sorted by wait time
 */
export function getRankedFoodStalls(stalls, category = null, n = 4) {
  if (!stalls) return [];
  let candidates = category
    ? stalls.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()))
    : stalls;
  if (candidates.length === 0) candidates = stalls;
  return [...candidates].sort((a, b) => a.waitTime - b.waitTime).slice(0, n);
}

/**
 * Returns the status color for display
 */
export function getStatusColor(status) {
  switch (status) {
    case "LOW": return "#10b981";
    case "MODERATE": return "#f59e0b";
    case "HIGH": return "#ef4444";
    default: return "#94a3b8";
  }
}

/**
 * Categorizes wait time into status
 */
export function waitTimeToStatus(minutes) {
  if (minutes <= 7) return "LOW";
  if (minutes <= 15) return "MODERATE";
  return "HIGH";
}

/**
 * BFS pathfinding through route graph
 */
export function findRoute(routeGraph, from, to) {
  if (!routeGraph[from] || !routeGraph[to]) return null;
  if (from === to) return [from];

  const queue = [[from]];
  const visited = new Set([from]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    const neighbors = routeGraph[node] || [];

    for (const neighbor of neighbors) {
      if (neighbor === to) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null; // No path found
}

/**
 * Returns zones with crowd level above threshold
 */
export function getHighCrowdZones(sections, threshold = 75) {
  return sections.filter((s) => s.crowdLevel >= threshold);
}

/**
 * Computes overall venue crowd score (0–100)
 */
export function getVenueCrowdScore(sections) {
  if (!sections || sections.length === 0) return 0;
  const avg = sections.reduce((sum, s) => sum + s.crowdLevel, 0) / sections.length;
  return Math.round(avg);
}

/**
 * Returns a human-readable occupancy string
 */
export function formatOccupancy(current, total) {
  const pct = Math.round((current / total) * 100);
  return `${pct}% (${current.toLocaleString()} / ${total.toLocaleString()})`;
}

/**
 * Simulate small random fluctuations in wait times
 */
export function simulateFluctuation(value, min = 1, max = 30, delta = 3) {
  const change = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
  return Math.max(min, Math.min(max, value + change));
}

/**
 * Simulate crowd density fluctuation
 */
export function simulateCrowdFluctuation(value, delta = 4) {
  const change = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
  return Math.max(5, Math.min(100, value + change));
}
