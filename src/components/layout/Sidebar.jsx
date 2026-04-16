import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useVenue } from '../../context/VenueContext.jsx';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { path: '/crowd', icon: '📊', label: 'Live Crowd' },
  { path: '/queues', icon: '⏱️', label: 'Queue Status' },
  { path: '/assistant', icon: '🤖', label: 'AI Assistant' },
  { path: '/navigator', icon: '🗺️', label: 'Navigator' },
  { path: '/accessibility', icon: '♿', label: 'Accessibility' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { venueInfo, lastUpdated } = useVenue();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>⚡</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoName}>StadiumIQ</span>
            <span className={styles.logoTagline}>Smart Assistant</span>
          </div>
        )}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Venue Info */}
      {!collapsed && (
        <div className={styles.venueInfo}>
          <div className={styles.liveTag}>
            <span className="live-dot" />
            LIVE
          </div>
          <p className={styles.venueName}>{venueInfo?.name}</p>
          <p className={styles.venueEvent}>{venueInfo?.event}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={styles.footer}>
          <div className={styles.updateTime}>
            <span className={styles.updateDot} />
            <span>Updated {lastUpdated}</span>
          </div>
          <div className={styles.capacity}>
            <span>🏟️ {((venueInfo?.currentAttendance / venueInfo?.capacity) * 100).toFixed(0)}% capacity</span>
          </div>
        </div>
      )}
    </aside>
  );
}
