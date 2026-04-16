import React, { useState } from 'react';
import { useVenue } from '../context/VenueContext.jsx';
import { getRankedGates, getRankedRestrooms, getRankedFoodStalls } from '../logic/venueLogic.js';
import WaitTimeBadge from '../components/shared/WaitTimeBadge.jsx';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import styles from './QueueStatus.module.css';

const TABS = [
  { id: 'gates', label: '🚪 Gates', count: 8 },
  { id: 'food', label: '🍔 Food Stalls', count: 12 },
  { id: 'restrooms', label: '🚻 Restrooms', count: 8 },
];

export default function QueueStatus() {
  const { gates, foodStalls, restrooms, lastUpdated } = useVenue();
  const [activeTab, setActiveTab] = useState('gates');
  const [sortBy, setSortBy] = useState('waitTime');

  const sortedGates = [...(gates || [])].sort((a, b) => a[sortBy] - b[sortBy]);
  const sortedFood = [...(foodStalls || [])].sort((a, b) =>
    sortBy === 'waitTime' ? a.waitTime - b.waitTime : a.queueLength - b.queueLength
  );
  const sortedRestrooms = [...(restrooms || [])].sort((a, b) => a.waitTime - b.waitTime);

  return (
    <div className="page-container animate-fade-up">
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Queue Status</h1>
          <p className="page-description">Live wait times across all venue queues · Auto-refreshes every 12s</p>
        </div>
        <div className={styles.updateBadge}>
          <span className="live-dot" />
          Updated {lastUpdated}
        </div>
      </div>

      {/* Summary Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🚪</div>
          <div>
            <div className={styles.summaryVal}>{getRankedGates(gates, 1)[0]?.waitTime ?? '--'} min</div>
            <div className={styles.summaryLabel}>Fastest Gate</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🍔</div>
          <div>
            <div className={styles.summaryVal}>{getRankedFoodStalls(foodStalls, null, 1)[0]?.waitTime ?? '--'} min</div>
            <div className={styles.summaryLabel}>Fastest Food</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🚻</div>
          <div>
            <div className={styles.summaryVal}>{getRankedRestrooms(restrooms, null, 1)[0]?.waitTime ?? '--'} min</div>
            <div className={styles.summaryLabel}>Nearest Restroom</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>⚠️</div>
          <div>
            <div className={styles.summaryVal}>{(gates || []).filter(g => g.status === 'HIGH').length}</div>
            <div className={styles.summaryLabel}>Congested Gates</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Sort by:</span>
        <button className={`btn btn-ghost ${sortBy === 'waitTime' ? styles.sortActive : ''}`}
          style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
          onClick={() => setSortBy('waitTime')}>⏱️ Wait Time</button>
        <button className={`btn btn-ghost ${sortBy === 'queueLength' ? styles.sortActive : ''}`}
          style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
          onClick={() => setSortBy('queueLength')}>👥 Queue Length</button>
      </div>

      {/* Gates Tab */}
      {activeTab === 'gates' && (
        <div className={styles.cardGrid}>
          {sortedGates.map((gate, i) => (
            <div key={gate.id} className={`card ${styles.queueCard} ${gate.isRecommended ? styles.recommended : ''}`}>
              {gate.isRecommended && (
                <div className={styles.recommendedBanner}>✓ RECOMMENDED</div>
              )}
              <div className={styles.cardHeader}>
                <div className={styles.gateIconWrap}>
                  <span className={styles.gateIconLetter}>{gate.label}</span>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{gate.name}</h3>
                  <p className={styles.cardMeta}>{gate.location}</p>
                </div>
                <WaitTimeBadge minutes={gate.waitTime} />
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{gate.queueLength}</span>
                  <span className={styles.statLabel}>In Queue</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{gate.waitTime}m</span>
                  <span className={styles.statLabel}>Wait</span>
                </div>
                <div className={styles.statItem}>
                  <StatusBadge status={gate.status} />
                  <span className={styles.statLabel}>Status</span>
                </div>
              </div>
              <ProgressBar value={gate.queueLength} max={500} status={gate.status} showLabel={false} height={4} />
              <p className={styles.cardDesc}>{gate.description}</p>
              <div className={styles.cardSections}>
                {gate.sections.map(s => (
                  <span key={s} className={styles.sectionTag}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Stalls Tab */}
      {activeTab === 'food' && (
        <div className={styles.cardGrid}>
          {sortedFood.map((stall) => (
            <div key={stall.id} className={`card ${styles.queueCard} ${stall.isRecommended ? styles.recommended : ''}`}>
              {stall.isRecommended && (
                <div className={styles.recommendedBanner}>✓ RECOMMENDED</div>
              )}
              <div className={styles.cardHeader}>
                <div className={styles.foodIcon}>🍴</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{stall.name}</h3>
                  <p className={styles.cardMeta}>{stall.category} · {stall.level}</p>
                </div>
                <WaitTimeBadge minutes={stall.waitTime} />
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{stall.queueLength}</span>
                  <span className={styles.statLabel}>In Queue</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{stall.price}</span>
                  <span className={styles.statLabel}>Price</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>⭐{stall.rating}</span>
                  <span className={styles.statLabel}>Rating</span>
                </div>
              </div>
              <ProgressBar value={stall.queueLength} max={60} status={stall.status} showLabel={false} height={4} />
              <div className={styles.menuItems}>
                {stall.items.map(item => (
                  <span key={item} className={styles.menuTag}>{item}</span>
                ))}
              </div>
              <div className={styles.stallMeta}>
                <span className={styles.zonePill}>{stall.zone} zone</span>
                <StatusBadge status={stall.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restrooms Tab */}
      {activeTab === 'restrooms' && (
        <div className={styles.cardGrid}>
          {sortedRestrooms.map((room) => (
            <div key={room.id} className={`card ${styles.queueCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.restroomIcon}>🚻</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{room.name}</h3>
                  <p className={styles.cardMeta}>{room.level} · {room.zone} zone</p>
                </div>
                <WaitTimeBadge minutes={room.waitTime} />
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{room.availableStalls}/{room.totalStalls}</span>
                  <span className={styles.statLabel}>Available</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{room.queueLength}</span>
                  <span className={styles.statLabel}>Waiting</span>
                </div>
                <div className={styles.statItem}>
                  <StatusBadge status={room.status} />
                  <span className={styles.statLabel}>Status</span>
                </div>
              </div>
              <ProgressBar
                value={room.totalStalls - room.availableStalls}
                max={room.totalStalls}
                status={room.status}
                showLabel={false}
                height={4}
              />
              {room.isAccessible && (
                <div className={styles.accessibleTag}>♿ Wheelchair Accessible</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
