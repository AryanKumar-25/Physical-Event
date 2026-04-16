import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VenueProvider } from './context/VenueContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CrowdView from './pages/CrowdView.jsx';
import QueueStatus from './pages/QueueStatus.jsx';
import Assistant from './pages/Assistant.jsx';
import Navigator from './pages/Navigator.jsx';
import AccessibilityMode from './pages/AccessibilityMode.jsx';

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crowd" element={<CrowdView />} />
          <Route path="/queues" element={<QueueStatus />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/navigator" element={<Navigator />} />
          <Route path="/accessibility" element={<AccessibilityMode />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <VenueProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page — no Sidebar/Navbar */}
            <Route path="/" element={<LandingPage />} />

            {/* All other pages — wrapped with Sidebar + Navbar */}
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </BrowserRouter>
      </VenueProvider>
    </AccessibilityProvider>
  );
}