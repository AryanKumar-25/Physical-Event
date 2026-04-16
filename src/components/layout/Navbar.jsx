import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useVenue } from '../../context/VenueContext.jsx';
import styles from './Navbar.module.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', icon: '⚡' },
  '/crowd': { title: 'Live Crowd View', icon: '📊' },
  '/queues': { title: 'Queue Status', icon: '⏱️' },
  '/assistant': { title: 'AI Assistant', icon: '🤖' },
  '/navigator': { title: 'Venue Navigator', icon: '🗺️' },
  '/accessibility': { title: 'Accessibility Mode', icon: '♿' },
};

export default function Navbar() {
  const location = useLocation();
  const { venueInfo, lastUpdated } = useVenue();
  const current = PAGE_TITLES[location.pathname] || { title: 'StadiumIQ', icon: '⚡' };

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.left}>
        <span className={styles.pageIcon}>{current.icon}</span>
        <div>
          <h1 className={styles.pageTitle}>{current.title}</h1>
          <p className={styles.pageSubtitle}>{venueInfo?.event} · {venueInfo?.date}</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.liveStatus}>
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
        <div className={styles.attendance}>
          <span className={styles.attendanceNum}>
            {venueInfo?.currentAttendance?.toLocaleString()}
          </span>
          <span className={styles.attendanceLabel}>attendees</span>
        </div>
        <div className={styles.weather}>
          🌤️ {venueInfo?.weather}
        </div>
        <NavLink to="/assistant" className={styles.assistantBtn} title="Open AI Assistant">
          <span>🤖</span>
          <span>Ask AI</span>
        </NavLink>
      </div>
    </header>
  );
}
