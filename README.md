# ⚡ StadiumIQ — Smart Stadium Assistant

A production-style web application for the **Physical Event Experience** challenge. StadiumIQ acts as a digital event companion for stadium visitors, reducing crowd congestion, minimizing wait times, and helping users navigate large-scale sporting venues in real time.

---

## 🎯 Chosen Vertical

**Physical Event Experience** — improving the attendee experience at large-scale sporting events through smart navigation, queue reduction, and AI-powered real-time assistance.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| Styling | Vanilla CSS with CSS Modules + CSS Custom Properties |
| Routing | React Router v6 |
| AI | Google Gemini API (`gemini-1.5-flash`) + Local fallback |
| State | React Context + useReducer |
| Data | Local JS objects with live simulation |

---

## 📋 Features

### 🏠 Dashboard
- Live venue overview (name, event, attendance, weather)
- Real-time crowd score meter (0–100)
- Quick-action cards: Best Gate, Nearest Restroom, Best Food, Navigate
- Fastest gates & food stalls ranked by wait time
- Live alert notification feed
- AI Assistant mini-panel with suggested queries

### 📊 Live Crowd View
- Zone-by-zone crowd density for all 12 seating sections
- Color-coded heatmap cards (GREEN = low, YELLOW = moderate, RED = high)
- Filterable by North / South / East / West zones
- Gate queue levels with animated progress bars

### ⏱️ Queue Status
- Tabbed view: **Gates | Food Stalls | Restrooms**
- Sortable by wait time or queue length
- Recommended best options highlighted with banner
- Detailed cards with capacity, queue length, wait time badge, description

### 🤖 AI Assistant
- Full chat-style interface with message history
- **Google Gemini API** integration for complex natural-language queries
- **Local rule-based logic** as fallback (works offline)
- Intent detection for: gates, restrooms, food, crowd, navigation, parking, wait times
- Venue context injected into every Gemini prompt
- Typing indicator, timestamp, source attribution (Gemini / Local AI)
- Quick-chip suggested questions
- Optional API key configuration (stored in React state)

### 🗺️ Venue Navigator
- Interactive SVG stadium map with gates, food stalls, restrooms
- Click any element to see details + "Navigate Here" shortcut
- **BFS route planner** — finds shortest path between any two points
- Route is visualized on the map as an animated dashed path
- "Best Right Now" panel: fastest gate, restroom, food stall
- Quick navigate panel with type filter

### ♿ Accessibility Mode
- Toggle: **High Contrast** (increased color contrast)
- Toggle: **Large Text** (112.5% base font size)
- Toggle: **Reduced Motion** (disables all animations)
- Settings applied as CSS classes on the root element
- Simplified text-only venue summary
- Emergency info: first aid, info desks, exits
- Keyboard navigation reference
- Screen reader ARIA support documentation

---

## 🧠 Logic & Algorithms

### Smart Recommendations (`venueLogic.js`)

| Function | Logic |
|---|---|
| `getBestGate(gates)` | Returns gate with minimum `waitTime` |
| `getRankedGates(gates, n)` | Sorts by `waitTime` ascending, takes top N |
| `getBestRestroom(restrooms, zone)` | Filters by zone if provided, then min wait |
| `getBestFoodStall(stalls, category, zone)` | Cascading filter by category → zone → min wait |
| `getVenueCrowdScore(sections)` | Averages all section `crowdLevel` values |
| `getHighCrowdZones(sections, threshold)` | Filters sections above crowd threshold |
| `findRoute(graph, from, to)` | BFS shortest path on adjacency graph |

### Live Simulation (`VenueContext.jsx`)

Every **12 seconds**, all data is updated:
- Gate wait times: ±3 min random fluctuation (clamped 1–35)
- Food stall wait times: ±2 min fluctuation
- Restroom wait times: ±2 min fluctuation
- Section crowd levels: ±3% fluctuation
- Recommended gate is recalculated after each update

### AI Assistant (`assistantLogic.js`)

1. **Intent detection** — keyword matching against 8 intent categories
2. **Zone/category extraction** — identifies "north", "burger", etc. from free text
3. **Local rule-based response** — constructs precise, data-grounded answers
4. **Gemini API fallback** — for unrecognized queries, sends venue snapshot as system context
5. **Hard fallback** — friendly help message if all else fails

---

## 📁 Project Structure

```
src/
├── context/
│   ├── VenueContext.jsx          # Global state + 12s live simulation
│   └── AccessibilityContext.jsx  # Accessibility toggles → CSS classes
├── data/
│   └── venueData.js              # 8 gates, 12 food stalls, 8 restrooms, 12 sections, route graph
├── logic/
│   ├── venueLogic.js             # Smart algorithms (BFS, recommendations, scoring)
│   └── assistantLogic.js         # Intent parsing + Gemini integration
├── components/
│   ├── layout/                   # Navbar, Sidebar
│   └── shared/                   # StatusBadge, ProgressBar, WaitTimeBadge, LoadingSpinner
└── pages/
    ├── Dashboard.jsx
    ├── CrowdView.jsx
    ├── QueueStatus.jsx
    ├── Assistant.jsx
    ├── Navigator.jsx
    └── AccessibilityMode.jsx
```

---

## ⚙️ Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at **http://localhost:3000**

---

## 🔑 Gemini API Key (Optional)

The AI assistant works fully without a Gemini key using local logic. To enable Gemini for complex queries:

1. Navigate to the **AI Assistant** page
2. Click **"Add Gemini API Key"** in the left panel
3. Paste your key (format: `AIza...`)
4. The assistant will now use Gemini for unrecognized questions

Get a free key at: [Google AI Studio](https://aistudio.google.com/)

---

## 🏗️ Assumptions

- **No live stadium API** — data is seeded locally and simulated with random fluctuations every 12 seconds. The architecture is designed for easy real-time API integration (replace `SIMULATE_UPDATE` dispatch with WebSocket/SSE data).
- **No authentication** — this is a public-facing visitor companion.
- **Single venue** — MetroArena Stadium with a fixed layout. Multi-venue support would require dynamic data loading.
- **Gemini API key** is optional and user-provided. No key is hardcoded.
- **Mobile sidebar** is hidden by default; app is optimized for tablet/desktop kiosk use.

---

## 🎨 Design System

Dark command-center theme with:
- **Base**: Deep navy (#080c18) with layered card surfaces
- **Accents**: Electric blue (#3b82f6) + cyan (#06b6d4)
- **Status**: Green (LOW) / Amber (MODERATE) / Red (HIGH)
- **Typography**: Inter (Google Fonts) — 300 to 900 weights
- **Animations**: fadeInUp entrance, pulse for HIGH status, ticker scrolls, glow effects

---

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "vite": "^5.4.8",
  "@vitejs/plugin-react": "^4.3.1"
}
```

No UI component libraries. No CSS frameworks. Pure React + CSS.