import React, { useState } from 'react';
import { useVenue } from '../context/VenueContext.jsx';
import { getVenueCrowdScore } from '../logic/venueLogic.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import ProgressBar from '../components/shared/ProgressBar.jsx';
import styles from './CrowdView.module.css';

const ZONES = ['all', 'north', 'south', 'east', 'west'];

export default function CrowdView() {
  const { sections, lastUpdated, gates } = useVenue();
  const [activeZone, setActiveZone] = useState('all');
  const crowdScore = getVenueCrowdScore(sections);

  const filtered = activeZone === 'all'
    ? sections
    : sections.filter(s => s.zone === activeZone);

  const zoneStats = ZONES.slice(1).map(zone => {
    const zoneSections = sections.filter(s => s.zone === zone);
    const avg = zoneSections.length
      ? Math.round(zoneSections.reduce((s, z) => s + z.crowdLevel, 0) / zoneSections.length)
      : 0;
    return { zone, avg };
  });

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Live Crowd View</h1>
        <p className="page-description">Real-time crowd density across all stadium sections · Updated {lastUpdated}</p>
      </div>

      {/* Zone Summary */}
      <div className={styles.zoneSummary}>
        {zoneStats.map(({ zone, avg }) => {
          const status = avg >= 75 ? 'HIGH' : avg >= 50 ? 'MODERATE' : 'LOW';
          return (
            <div key={zone} className={`${styles.zoneCard} ${activeZone === zone ? styles.zoneCardActive : ''}`}
              onClick={() => setActiveZone(activeZone === zone ? 'all' : zone)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setActiveZone(activeZone === zone ? 'all' : zone)}
            >
              <div className={styles.zoneCardHeader}>
                <span className={styles.zoneCardName}>{zone.charAt(0).toUpperCase() + zone.slice(1)} Stand</span>
                <StatusBadge status={status} />
              </div>
              <div className={styles.zoneCardScore} style={{
                color: status === 'HIGH' ? 'var(--status-high)' : status === 'MODERATE' ? 'var(--status-moderate)' : 'var(--status-low)'
              }}>{avg}%</div>
              <ProgressBar value={avg} max={100} status={status} showLabel={false} height={6} />
              <div className={styles.zoneCardLabel}>Avg Crowd Density</div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {ZONES.map(z => (
          <button key={z} className={`tab ${activeZone === z ? 'active' : ''}`}
            onClick={() => setActiveZone(z)}>
            {z === 'all' ? 'All Zones' : `${z.charAt(0).toUpperCase() + z.slice(1)} Stand`}
          </button>
        ))}
      </div>

      {/* Crowd Grid */}
      <div className={styles.crowdGrid}>
        {filtered.map(section => {
          const status = section.crowdLevel >= 80 ? 'HIGH' : section.crowdLevel >= 55 ? 'MODERATE' : 'LOW';
          return (
            <div key={section.id} className={`${styles.sectionCard} card`}
              style={{ borderColor: section.crowdLevel >= 80 ? 'rgba(239,68,68,0.3)' : section.crowdLevel >= 55 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' }}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionId}>{section.id}</span>
                  <h3 className={styles.sectionName}>{section.name}</h3>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className={styles.sectionMeter}>
                <div className={styles.sectionNum} style={{
                  color: status === 'HIGH' ? 'var(--status-high)' : status === 'MODERATE' ? 'var(--status-moderate)' : 'var(--status-low)'
                }}>
                  {section.crowdLevel}%
                </div>
                <div className={styles.sectionCapacity}>
                  {Math.round(section.capacity * section.crowdLevel / 100).toLocaleString()} / {section.capacity.toLocaleString()}
                </div>
              </div>
              <ProgressBar value={section.crowdLevel} max={100} status={status} showLabel={false} height={8} />
              <div className={styles.sectionZone}>{section.zone} zone</div>
            </div>
          );
        })}
      </div>

      {/* Gate Crowd Level */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>🚪 Gate Queue Levels</h2>
        <div className={styles.gateGrid}>
          {(gates || []).map(gate => (
            <div key={gate.id} className={styles.gateItem}>
              <div className={styles.gateLabel}>
                <span className={styles.gateBadge}>{gate.label}</span>
                <div>
                  <div className={styles.gateName}>{gate.name}</div>
                  <div className={styles.gateLoc}>{gate.location}</div>
                </div>
              </div>
              <ProgressBar
                value={gate.queueLength}
                max={500}
                status={gate.status}
                label={`${gate.queueLength} in queue · ${gate.waitTime} min wait`}
                height={6}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
