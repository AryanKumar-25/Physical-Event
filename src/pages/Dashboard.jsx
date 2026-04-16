import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVenue } from '../context/VenueContext.jsx';
import {
  getBestGate, getBestRestroom, getBestFoodStall,
  getVenueCrowdScore, getHighCrowdZones, getRankedGates
} from '../logic/venueLogic.js';
import WaitTimeBadge from '../components/shared/WaitTimeBadge.jsx';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { gates, restrooms, foodStalls, sections, venueInfo, alerts, lastUpdated } = useVenue();
  const navigate = useNavigate();

  const bestGate = getBestGate(gates);
  const bestRestroom = getBestRestroom(restrooms);
  const bestFood = getBestFoodStall(foodStalls);
  const crowdScore = getVenueCrowdScore(sections);
  const highCrowd = getHighCrowdZones(sections);
  const topGates = getRankedGates(gates, 3);
  const topFood = [...(foodStalls || [])].sort((a, b) => a.waitTime - b.waitTime).slice(0, 3);
  const fillPct = venueInfo ? Math.round((venueInfo.currentAttendance / venueInfo.capacity) * 100) : 0;

  const crowdStatus = crowdScore >= 75 ? 'HIGH' : crowdScore >= 50 ? 'MODERATE' : 'LOW';

  return (
    <div className="page-container animate-fade-up">
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadges}>
            <span className="badge badge-live">
              <span className="live-dot" style={{ width: 6, height: 6 }} /> LIVE EVENT
            </span>
            <span className={styles.heroDate}>{venueInfo?.date}</span>
          </div>
          <h1 className={styles.heroTitle}>{venueInfo?.name}</h1>
          <p className={styles.heroEvent}>{venueInfo?.event}</p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{venueInfo?.currentAttendance?.toLocaleString()}</span>
              <span className={styles.heroStatLabel}>Attendees</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{fillPct}%</span>
              <span className={styles.heroStatLabel}>Capacity</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{highCrowd.length}</span>
              <span className={styles.heroStatLabel}>Congested Zones</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{venueInfo?.weather}</span>
              <span className={styles.heroStatLabel}>Weather</span>
            </div>
          </div>
        </div>
        <div className={styles.heroCrowdMeter}>
          <div className={styles.meterLabel}>Venue Crowd Score</div>
          <div className={styles.meterValue} style={{
            color: crowdStatus === 'HIGH' ? 'var(--status-high)' : crowdStatus === 'MODERATE' ? 'var(--status-moderate)' : 'var(--status-low)'
          }}>
            {crowdScore}
          </div>
          <div className={styles.meterSub}>/100</div>
          <StatusBadge status={crowdStatus} />
          <ProgressBar value={crowdScore} max={100} status={crowdStatus} showLabel={false} height={8} />
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className={styles.quickActions}>
        <button className={`${styles.actionCard} ${styles.actionGate}`} onClick={() => navigate('/queues')}>
          <div className={styles.actionIcon}>🚪</div>
          <div className={styles.actionInfo}>
            <div className={styles.actionTitle}>Best Gate</div>
            <div className={styles.actionValue}>{bestGate?.name}</div>
            <div className={styles.actionMeta}>{bestGate?.location}</div>
          </div>
          <WaitTimeBadge minutes={bestGate?.waitTime || 0} />
        </button>

        <button className={`${styles.actionCard} ${styles.actionRestroom}`} onClick={() => navigate('/queues')}>
          <div className={styles.actionIcon}>🚻</div>
          <div className={styles.actionInfo}>
            <div className={styles.actionTitle}>Nearest Restroom</div>
            <div className={styles.actionValue}>{bestRestroom?.name}</div>
            <div className={styles.actionMeta}>{bestRestroom?.level}</div>
          </div>
          <WaitTimeBadge minutes={bestRestroom?.waitTime || 0} />
        </button>

        <button className={`${styles.actionCard} ${styles.actionFood}`} onClick={() => navigate('/queues')}>
          <div className={styles.actionIcon}>🍔</div>
          <div className={styles.actionInfo}>
            <div className={styles.actionTitle}>Best Food Stall</div>
            <div className={styles.actionValue}>{bestFood?.name}</div>
            <div className={styles.actionMeta}>{bestFood?.category}</div>
          </div>
          <WaitTimeBadge minutes={bestFood?.waitTime || 0} />
        </button>

        <button className={`${styles.actionCard} ${styles.actionNav}`} onClick={() => navigate('/navigator')}>
          <div className={styles.actionIcon}>🗺️</div>
          <div className={styles.actionInfo}>
            <div className={styles.actionTitle}>Navigate Venue</div>
            <div className={styles.actionValue}>Open Map</div>
            <div className={styles.actionMeta}>Route planner</div>
          </div>
          <span style={{ fontSize: '1.5rem' }}>›</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left: Gates + Food */}
        <div className={styles.leftCol}>
          {/* Top Gates */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🚪 Fastest Gates</h2>
              <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }} onClick={() => navigate('/queues')}>See All</button>
            </div>
            <div className={styles.listItems}>
              {topGates.map((gate, i) => (
                <div key={gate.id} className={styles.listItem}>
                  <div className={styles.listRank}>{i + 1}</div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{gate.name}</div>
                    <div className={styles.listMeta}>{gate.location} · {gate.queueLength} in queue</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <WaitTimeBadge minutes={gate.waitTime} />
                    {gate.isRecommended && <span className="recommended-tag">✓ Best</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Food */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🍔 Fastest Food Stalls</h2>
              <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }} onClick={() => navigate('/queues')}>See All</button>
            </div>
            <div className={styles.listItems}>
              {topFood.map((stall, i) => (
                <div key={stall.id} className={styles.listItem}>
                  <div className={styles.listRank}>{i + 1}</div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{stall.name}</div>
                    <div className={styles.listMeta}>{stall.category} · {stall.zone} zone · {stall.price}</div>
                  </div>
                  <WaitTimeBadge minutes={stall.waitTime} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Alerts + AI Panel */}
        <div className={styles.rightCol}>
          {/* Live Alert Feed */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">🔔 Live Alerts</h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Updated {lastUpdated}</span>
            </div>
            <div className={styles.alertList}>
              {(alerts || []).slice(0, 5).map((alert) => (
                <div key={alert.id} className={`${styles.alertItem} ${styles['alert' + alert.type]}`}>
                  <span className={styles.alertIcon}>
                    {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div className={styles.alertContent}>
                    <p className={styles.alertMsg}>{alert.message}</p>
                    <span className={styles.alertTime}>{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Quick Panel */}
          <div className={`card ${styles.aiPanel}`}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>🤖</div>
              <div>
                <div className={styles.aiTitle}>AI Assistant</div>
                <div className={styles.aiSub}>Powered by Gemini</div>
              </div>
              <span className="badge badge-live" style={{ marginLeft: 'auto' }}>Active</span>
            </div>
            <div className={styles.aiSuggestions}>
              {[
                "Which gate has the shortest line?",
                "Find me food near north stand",
                "How crowded is the west section?",
              ].map((q) => (
                <button
                  key={q}
                  className={styles.aiChip}
                  onClick={() => navigate('/assistant', { state: { query: q } })}
                >
                  {q}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => navigate('/assistant')}>
              Open Assistant →
            </button>
          </div>
        </div>
      </div>

      {/* Crowd Heatmap Preview */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">📊 Zone Crowd Overview</h2>
          <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }} onClick={() => navigate('/crowd')}>Full View</button>
        </div>
        <div className="grid-4">
          {(sections || []).map((section) => (
            <div key={section.id} className={styles.zoneChip}>
              <div className={styles.zoneChipHeader}>
                <span className={styles.zoneChipId}>{section.id}</span>
                <StatusBadge status={section.crowdLevel >= 80 ? 'HIGH' : section.crowdLevel >= 55 ? 'MODERATE' : 'LOW'} />
              </div>
              <div className={styles.zoneChipName}>{section.name}</div>
              <ProgressBar
                value={section.crowdLevel}
                max={100}
                status={section.crowdLevel >= 80 ? 'HIGH' : section.crowdLevel >= 55 ? 'MODERATE' : 'LOW'}
                showLabel={false}
                height={4}
              />
              <div className={styles.zoneChipPct}>{section.crowdLevel}% full</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
