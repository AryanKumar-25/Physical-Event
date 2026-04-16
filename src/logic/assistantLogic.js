// ============================================================
// STADIUMIQ — AI Assistant Logic
// Intent parsing + local rule-based answers + Gemini fallback
// ============================================================

import { getBestGate, getBestRestroom, getBestFoodStall, getRankedGates, getRankedRestrooms, getRankedFoodStalls } from './venueLogic.js';

// ─── Intent Detection ────────────────────────────────────────
const INTENTS = {
  GATE: ['gate', 'enter', 'entrance', 'shortest line', 'best gate', 'which gate', 'entry', 'queue gate'],
  RESTROOM: ['restroom', 'bathroom', 'toilet', 'wc', 'washroom', 'loo', 'nearest restroom', 'where is the rest'],
  FOOD: ['food', 'eat', 'hungry', 'stall', 'burger', 'pizza', 'snack', 'drink', 'least crowded food', 'where can i', 'restaurant', 'nachos', 'fries'],
  CROWD: ['crowd', 'crowded', 'busy', 'congestion', 'packed', 'empty', 'quiet', 'density'],
  NAVIGATE: ['navigate', 'directions', 'how to get', 'where is', 'find', 'location', 'map', 'route', 'go to', 'reach'],
  WAIT: ['wait', 'how long', 'time', 'queue', 'line', 'waiting'],
  PARKING: ['parking', 'park', 'car', 'lot'],
  HELP: ['help', 'what can you', 'features', 'options', 'what do'],
  GREETING: ['hello', 'hi', 'hey', 'good', 'thanks', 'thank you', 'great'],
};

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return 'UNKNOWN';
}

// ─── Zone Extraction ─────────────────────────────────────────
function extractZone(text) {
  const lower = text.toLowerCase();
  if (lower.includes('north')) return 'north';
  if (lower.includes('south')) return 'south';
  if (lower.includes('east')) return 'east';
  if (lower.includes('west')) return 'west';
  return null;
}

// ─── Category Extraction ─────────────────────────────────────
function extractFoodCategory(text) {
  const lower = text.toLowerCase();
  const categories = ['burger', 'pizza', 'snack', 'drink', 'asian', 'bbq', 'mexican', 'dessert', 'healthy', 'beverage'];
  for (const cat of categories) {
    if (lower.includes(cat)) return cat;
  }
  return null;
}

// ─── Response Builder ────────────────────────────────────────
function formatWait(minutes) {
  if (minutes <= 2) return 'under 2 minutes';
  if (minutes <= 5) return `about ${minutes} minutes`;
  return `${minutes} minutes`;
}

export function getLocalAnswer(text, venueData) {
  const { gates, restrooms, foodStalls, sections, venueInfo } = venueData;
  const intent = detectIntent(text);
  const zone = extractZone(text);
  const foodCat = extractFoodCategory(text);

  switch (intent) {
    case 'GREETING': {
      const responses = [
        `Hey there! 👋 Welcome to ${venueInfo?.name || 'MetroArena'}! I'm your smart stadium assistant. Ask me about gates, queues, food stalls, restrooms, or navigation — I'm here to help!`,
        `Hello! I'm StadiumIQ — your event companion for tonight. How can I help you enjoy the game?`,
        `Hi! Ready to help you navigate ${venueInfo?.name || 'the stadium'}. What do you need?`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    case 'GATE': {
      const best = getBestGate(gates);
      const ranked = getRankedGates(gates, 3);
      if (!best) return "I couldn't find gate data right now. Please check the Queue Status page.";
      return `🚪 **Best gate right now: ${best.name}** (${best.location})\n\n` +
        `⏱️ Wait time: **${formatWait(best.waitTime)}** — only ${best.queueLength} people in line!\n\n` +
        `**Top 3 fastest gates:**\n` +
        ranked.map((g, i) => `${i + 1}. ${g.name} — ${g.waitTime} min (${g.status})`).join('\n') +
        `\n\n💡 Tip: Gates G and C are currently congested — avoid them if possible.`;
    }

    case 'RESTROOM': {
      const best = getBestRestroom(restrooms, zone);
      const ranked = getRankedRestrooms(restrooms, zone, 3);
      if (!best) return "Restroom data is not available right now.";
      return `🚻 **Nearest low-wait restroom: ${best.name}**\n\n` +
        `📍 Location: ${best.level}${zone ? ` (${zone} zone)` : ''}\n` +
        `⏱️ Wait: **${formatWait(best.waitTime)}** — ${best.availableStalls} stalls available\n\n` +
        `**Also available:**\n` +
        ranked.slice(1).map((r) => `• ${r.name} — ${r.waitTime} min wait`).join('\n') +
        (best.isAccessible ? '\n\n♿ This restroom is wheelchair accessible.' : '');
    }

    case 'FOOD': {
      const best = getBestFoodStall(foodStalls, foodCat, zone);
      const ranked = getRankedFoodStalls(foodStalls, foodCat, 4);
      if (!best) return "Food stall data is not available right now.";
      return `🍔 **Best food option right now: ${best.name}**\n\n` +
        `📍 ${best.level} — ${best.zone} zone\n` +
        `⏱️ Wait: **${formatWait(best.waitTime)}** — only ${best.queueLength} people\n` +
        `🗂️ Menu: ${best.items.join(', ')}\n` +
        `⭐ Rating: ${best.rating}/5  |  💰 ${best.price}\n\n` +
        `**Other fast options:**\n` +
        ranked.slice(1, 4).map((s) => `• ${s.name} (${s.zone}) — ${s.waitTime} min`).join('\n');
    }

    case 'CROWD': {
      const highCrowd = sections?.filter((s) => s.crowdLevel >= 80) || [];
      const lowCrowd = sections?.filter((s) => s.crowdLevel < 55) || [];
      return `📊 **Current Crowd Status:**\n\n` +
        `🔴 **High density zones:**\n` +
        (highCrowd.length > 0
          ? highCrowd.map((s) => `• ${s.name}: ${s.crowdLevel}% full`).join('\n')
          : '• None currently') +
        `\n\n🟢 **Less crowded zones:**\n` +
        (lowCrowd.length > 0
          ? lowCrowd.map((s) => `• ${s.name}: ${s.crowdLevel}% full`).join('\n')
          : '• All areas filling up') +
        `\n\n💡 Try the South Stand sections — they have the most space right now!`;
    }

    case 'WAIT': {
      const avgGate = gates ? Math.round(gates.reduce((s, g) => s + g.waitTime, 0) / gates.length) : 0;
      const avgFood = foodStalls ? Math.round(foodStalls.reduce((s, f) => s + f.waitTime, 0) / foodStalls.length) : 0;
      return `⏱️ **Current Average Wait Times:**\n\n` +
        `🚪 Gates: ~${avgGate} min average (${getBestGate(gates)?.name} is fastest at ${getBestGate(gates)?.waitTime} min)\n` +
        `🍔 Food Stalls: ~${avgFood} min average (${getBestFoodStall(foodStalls)?.name} is fastest at ${getBestFoodStall(foodStalls)?.waitTime} min)\n` +
        `🚻 Restrooms: ${getBestRestroom(restrooms)?.name} has ${getBestRestroom(restrooms)?.waitTime} min wait\n\n` +
        `💡 South side is consistently faster tonight — worth the extra walk!`;
    }

    case 'NAVIGATE': {
      return `🗺️ **Navigation Help**\n\n` +
        `Use the **Venue Navigator** page to:\n` +
        `• Click any zone on the stadium map\n` +
        `• Get step-by-step directions\n` +
        `• Find the best route from your current gate\n\n` +
        `**Quick directions:**\n` +
        `• North seats → Gate A or H (4-5 min wait)\n` +
        `• South seats → Gate E or F (6-7 min wait)\n` +
        `• East seats → Gate D (12 min wait)\n` +
        `• West seats → Gate H → walk west concourse\n\n` +
        `💡 Avoid Gate G and C right now — very long queues.`;
    }

    case 'PARKING': {
      return `🅿️ **Parking Information:**\n\n` +
        `• **Lot P1** — North entrance, Gate A (nearly full)\n` +
        `• **Lot P2** — East entrance, Gate C (very congested)\n` +
        `• **Lot P3** — South-West, Gate F (just opened, plenty of space! ✅)\n\n` +
        `💡 **Recommendation:** Use Lot P3 → Gate F → South-West entrance for fastest access tonight.`;
    }

    case 'HELP': {
      return `👋 **I can help you with:**\n\n` +
        `🚪 **Gates** — Find the shortest entry queue\n` +
        `🚻 **Restrooms** — Locate nearest available restroom\n` +
        `🍔 **Food** — Find least crowded food stalls\n` +
        `📊 **Crowd** — Check density by zone\n` +
        `⏱️ **Wait times** — Live queue estimates\n` +
        `🗺️ **Navigation** — Directions to any venue area\n` +
        `🅿️ **Parking** — Find the best parking lot\n\n` +
        `Just ask me anything in plain English! 😊`;
    }

    default: {
      return null; // Signal to use Gemini API
    }
  }
}

// ─── Gemini API Integration ──────────────────────────────────
export async function getGeminiAnswer(userMessage, venueData, apiKey) {
  if (!apiKey) return null;

  const { gates, restrooms, foodStalls, sections, venueInfo } = venueData;

  const venueSnapshot = `
Venue: ${venueInfo?.name}, Event: ${venueInfo?.event}
Gates: ${gates?.map(g => `${g.name}(${g.waitTime}min,${g.status})`).join(', ')}
Food Stalls: ${foodStalls?.slice(0, 6).map(f => `${f.name}(${f.waitTime}min,${f.zone})`).join(', ')}
Restrooms: ${restrooms?.map(r => `${r.name}(${r.waitTime}min,${r.status})`).join(', ')}
High Crowd Sections: ${sections?.filter(s => s.crowdLevel > 75).map(s => `${s.id}(${s.crowdLevel}%)`).join(', ')}
  `.trim();

  const prompt = `You are StadiumIQ, a smart stadium assistant at ${venueInfo?.name}. 
Answer the following visitor question concisely and helpfully based on this real-time venue data:

VENUE DATA:
${venueSnapshot}

VISITOR QUESTION: ${userMessage}

Respond in a helpful, friendly tone. Use emojis sparingly. Keep the answer under 150 words.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ─── Main Assistant Entry Point ──────────────────────────────
export async function getAssistantResponse(userMessage, venueData, apiKey = null) {
  // 1. Try local logic first
  const local = getLocalAnswer(userMessage, venueData);
  if (local) return { text: local, source: 'local' };

  // 2. Try Gemini if key is available
  if (apiKey) {
    const gemini = await getGeminiAnswer(userMessage, venueData, apiKey);
    if (gemini) return { text: gemini, source: 'gemini' };
  }

  // 3. Fallback
  return {
    text: `🤔 I'm not sure about that one. Try asking about:\n• **Gates** — "Which gate is fastest?"\n• **Food** — "Where can I eat?"\n• **Restrooms** — "Find me a restroom"\n• **Crowd** — "How busy is the west stand?"\n\nOr visit the **Queue Status** and **Navigator** pages for live data!`,
    source: 'fallback',
  };
}

// ─── Suggested Questions ─────────────────────────────────────
export const SUGGESTED_QUESTIONS = [
  "Which gate has the shortest line?",
  "Where is the nearest restroom?",
  "What food stall is least crowded?",
  "How crowded is the west stand?",
  "What's the average wait time?",
  "Where can I park tonight?",
  "Find me something to eat near the north stand",
  "Which areas should I avoid?",
];
