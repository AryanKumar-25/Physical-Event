import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { useVenue } from '../context/VenueContext.jsx';
import { getBestGate, getBestRestroom, getBestFoodStall } from '../logic/venueLogic.js';
import WaitTimeBadge from '../components/shared/WaitTimeBadge.jsx';
import styles from './AccessibilityMode.module.css';

function Toggle({ label, description, checked, onChange, id }) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <label htmlFor={id} className={styles.toggleLabel}>{label}</label>
        <p className={styles.toggleDesc}>{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        aria-label={`${label}: ${checked ? 'On' : 'Off'}`}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

export default function AccessibilityMode() {
  const { highContrast, setHighContrast, largeText, setLargeText, reducedMotion, setReducedMotion } = useAccessibility();
  const { gates, restrooms, foodStalls, venueInfo } = useVenue();

  const bestGate = getBestGate(gates);
  const bestRestroom = getBestRestroom(restrooms);
  const bestFood = getBestFoodStall(foodStalls);

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Accessibility Mode</h1>
        <p className="page-description">Configure display settings for a more comfortable experience</p>
      </div>

      <div className={styles.accessLayout}>
        {/* Settings Panel */}
        <div className={styles.settingsCol}>
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>♿ Display Settings</h2>

            <Toggle
              id="high-contrast"
              label="High Contrast Mode"
              description="Increases color contrast for better visibility"
              checked={highContrast}
              onChange={setHighContrast}
            />
            <div className="divider" />
            <Toggle
              id="large-text"
              label="Large Text"
              description="Increases base font size by 12.5% across the app"
              checked={largeText}
              onChange={setLargeText}
            />
            <div className="divider" />
            <Toggle
              id="reduced-motion"
              label="Reduce Motion"
              description="Disables animations and transitions for users with motion sensitivity"
              checked={reducedMotion}
              onChange={setReducedMotion}
            />
          </div>

          {/* Status */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Current Settings</h2>
            <div className={styles.statusGrid}>
              <div className={`${styles.statusItem} ${highContrast ? styles.statusOn : styles.statusOff}`}>
                <span>🎨</span>
                <div>
                  <div className={styles.statusLabel}>High Contrast</div>
                  <div className={styles.statusVal}>{highContrast ? 'Active' : 'Off'}</div>
                </div>
              </div>
              <div className={`${styles.statusItem} ${largeText ? styles.statusOn : styles.statusOff}`}>
                <span>🔡</span>
                <div>
                  <div className={styles.statusLabel}>Large Text</div>
                  <div className={styles.statusVal}>{largeText ? 'Active' : 'Off'}</div>
                </div>
              </div>
              <div className={`${styles.statusItem} ${reducedMotion ? styles.statusOn : styles.statusOff}`}>
                <span>🔇</span>
                <div>
                  <div className={styles.statusLabel}>Reduced Motion</div>
                  <div className={styles.statusVal}>{reducedMotion ? 'Active' : 'Off'}</div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => { setHighContrast(false); setLargeText(false); setReducedMotion(false); }}
            >
              Reset All Settings
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>⌨️ Keyboard Navigation</h2>
            <div className={styles.shortcutList}>
              {[
                { key: 'Tab', desc: 'Move between elements' },
                { key: 'Enter / Space', desc: 'Activate buttons and links' },
                { key: 'Arrow Keys', desc: 'Navigate within components' },
                { key: 'Esc', desc: 'Close dialogs and menus' },
              ].map(({ key, desc }) => (
                <div key={key} className={styles.shortcutItem}>
                  <kbd className={styles.kbd}>{key}</kbd>
                  <span className={styles.shortcutDesc}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simplified Venue Summary */}
        <div className={styles.summaryCol}>
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>📋 Simplified Venue Summary</h2>
            <p className={styles.summaryIntro}>
              You are at <strong>{venueInfo?.name}</strong> for <strong>{venueInfo?.event}</strong>.
            </p>

            <div className={styles.summaryBlock} aria-label="Best gate recommendation">
              <div className={styles.summaryIcon}>🚪</div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryTitle}>Best Gate to Enter</div>
                <div className={styles.summaryName}>{bestGate?.name}</div>
                <div className={styles.summaryLocation}>{bestGate?.location}</div>
                <WaitTimeBadge minutes={bestGate?.waitTime || 0} />
              </div>
            </div>

            <div className={styles.summaryBlock} aria-label="Nearest restroom">
              <div className={styles.summaryIcon}>🚻</div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryTitle}>Nearest Restroom (Lowest Wait)</div>
                <div className={styles.summaryName}>{bestRestroom?.name}</div>
                <div className={styles.summaryLocation}>{bestRestroom?.level} · {bestRestroom?.zone} zone</div>
                {bestRestroom?.isAccessible && (
                  <div className={styles.accessibleNote}>♿ Wheelchair Accessible</div>
                )}
                <WaitTimeBadge minutes={bestRestroom?.waitTime || 0} />
              </div>
            </div>

            <div className={styles.summaryBlock} aria-label="Recommended food stall">
              <div className={styles.summaryIcon}>🍔</div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryTitle}>Shortest Food Queue</div>
                <div className={styles.summaryName}>{bestFood?.name}</div>
                <div className={styles.summaryLocation}>{bestFood?.category} · {bestFood?.zone} zone</div>
                <div className={styles.summaryItems}>{bestFood?.items?.join(', ')}</div>
                <WaitTimeBadge minutes={bestFood?.waitTime || 0} />
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className={`card ${styles.emergencyCard}`} role="region" aria-label="Emergency information">
            <h2 className="section-title" style={{ marginBottom: '0.75rem', color: 'var(--status-moderate)' }}>
              🏥 Emergency & Help
            </h2>
            <div className={styles.emergencyList}>
              <div className={styles.emergencyItem}>
                <span>🏥</span>
                <div>
                  <div className={styles.emergencyLabel}>First Aid Stations</div>
                  <div className={styles.emergencyVal}>North entrance & South entrance</div>
                </div>
              </div>
              <div className={styles.emergencyItem}>
                <span>ℹ️</span>
                <div>
                  <div className={styles.emergencyLabel}>Information Desk</div>
                  <div className={styles.emergencyVal}>Gate A lobby & Gate E lobby</div>
                </div>
              </div>
              <div className={styles.emergencyItem}>
                <span>♿</span>
                <div>
                  <div className={styles.emergencyLabel}>Accessibility Services</div>
                  <div className={styles.emergencyVal}>Available at all main gates</div>
                </div>
              </div>
              <div className={styles.emergencyItem}>
                <span>🚨</span>
                <div>
                  <div className={styles.emergencyLabel}>Emergency Exit</div>
                  <div className={styles.emergencyVal}>All 8 gates serve as emergency exits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Reader Note */}
          <div className="card" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
            <h2 className="section-title" style={{ marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
              🔊 Screen Reader Support
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              This application includes ARIA labels, roles, and live regions. All interactive elements are keyboard navigable. Status updates are announced via <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4, fontSize: '0.8em' }}>aria-live</code> regions on the AI chat page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
