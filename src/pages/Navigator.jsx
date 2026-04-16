import React, { useState } from 'react';
import { useVenue } from '../context/VenueContext.jsx';
import { findRoute, getBestGate, getBestRestroom, getBestFoodStall } from '../logic/venueLogic.js';
import { ROUTES, LANDMARKS } from '../data/venueData.js';
import WaitTimeBadge from '../components/shared/WaitTimeBadge.jsx';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import styles from './Navigator.module.css';

const ZONE_COLORS = {
  HIGH: 'rgba(239,68,68,0.6)',
  MODERATE: 'rgba(245,158,11,0.6)',
  LOW: 'rgba(16,185,129,0.6)',
};

export default function Navigator() {
  const { gates, restrooms, foodStalls, sections } = useVenue();
  const [selectedZone, setSelectedZone] = useState(null);
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [route, setRoute] = useState(null);
  const [filter, setFilter] = useState('all');

  const bestGate = getBestGate(gates);
  const bestRestroom = getBestRestroom(restrooms);
  const bestFood = getBestFoodStall(foodStalls);

  function handleFindRoute() {
    if (!fromNode || !toNode) return;
    const result = findRoute(ROUTES, fromNode, toNode);
    setRoute(result);
  }

  function getNodeLabel(nodeId) {
    const gate = gates?.find(g => g.id === nodeId);
    if (gate) return `${gate.name} (${gate.location})`;
    const rs = restrooms?.find(r => r.id === nodeId);
    if (rs) return rs.name;
    const fs = foodStalls?.find(f => f.id === nodeId);
    if (fs) return fs.name;
    return nodeId.toUpperCase();
  }

  // Quick destination options
  const allNodes = [
    ...(gates || []).map(g => ({ id: g.id, label: g.name, type: 'gate' })),
    ...(restrooms || []).map(r => ({ id: r.id, label: r.name, type: 'restroom' })),
    ...(foodStalls || []).map(f => ({ id: f.id, label: f.name, type: 'food' })),
  ];

  const filteredNodes = filter === 'all' ? allNodes : allNodes.filter(n => n.type === filter);

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Venue Navigator</h1>
        <p className="page-description">Explore the stadium map, plan routes, and find the best paths</p>
      </div>

      <div className={styles.navigatorLayout}>
        {/* Left: Map */}
        <div className={styles.mapSection}>
          {/* Stadium SVG Map */}
          <div className={`card ${styles.mapCard}`}>
            <div className={styles.mapHeader}>
              <span className={styles.mapTitle}>🏟️ MetroArena Stadium</span>
              <div className={styles.mapLegend}>
                <span className={styles.legendItem}><span style={{ background: 'var(--status-low)' }} className={styles.legendDot} />Low</span>
                <span className={styles.legendItem}><span style={{ background: 'var(--status-moderate)' }} className={styles.legendDot} />Moderate</span>
                <span className={styles.legendItem}><span style={{ background: 'var(--status-high)' }} className={styles.legendDot} />High</span>
              </div>
            </div>
            <div className={styles.mapContainer}>
              <svg viewBox="0 0 400 400" className={styles.stadiumSvg} aria-label="Stadium map">
                {/* Outer Stadium Ring */}
                <ellipse cx="200" cy="200" rx="185" ry="185" fill="#0f1629" stroke="rgba(59,130,246,0.3)" strokeWidth="2" />
                {/* Inner Field */}
                <ellipse cx="200" cy="200" rx="95" ry="85" fill="#0a3d1f" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" />
                {/* Field lines */}
                <ellipse cx="200" cy="200" rx="60" ry="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="200" y1="115" x2="200" y2="285" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="200" y="205" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11" fontWeight="700">FIELD</text>

                {/* North Stand */}
                <path d="M 90 55 Q 200 15 310 55 L 295 100 Q 200 68 105 100 Z" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                <text x="200" y="75" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600">NORTH STAND</text>

                {/* South Stand */}
                <path d="M 90 345 Q 200 385 310 345 L 295 300 Q 200 332 105 300 Z" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                <text x="200" y="365" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600">SOUTH STAND</text>

                {/* East Stand */}
                <path d="M 345 90 Q 385 200 345 310 L 300 295 Q 332 200 300 105 Z" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                <text x="355" y="204" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600" transform="rotate(90, 355, 200)">EAST STAND</text>

                {/* West Stand */}
                <path d="M 55 90 Q 15 200 55 310 L 100 295 Q 68 200 100 105 Z" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                <text x="45" y="204" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600" transform="rotate(-90, 45, 200)">WEST STAND</text>

                {/* Gates */}
                {(gates || []).map((gate) => {
                  const x = gate.mapX * 4;
                  const y = gate.mapY * 4;
                  const color = gate.status === 'LOW' ? '#10b981' : gate.status === 'MODERATE' ? '#f59e0b' : '#ef4444';
                  const isSelected = selectedZone === gate.id;
                  return (
                    <g key={gate.id} onClick={() => setSelectedZone(isSelected ? null : gate.id)} style={{ cursor: 'pointer' }}>
                      <circle cx={x} cy={y} r={isSelected ? 16 : 12} fill={color} opacity="0.25" />
                      <circle cx={x} cy={y} r={isSelected ? 10 : 7} fill={color} opacity="0.9"
                        stroke={isSelected ? 'white' : 'transparent'} strokeWidth="2" />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize="8" fontWeight="800">{gate.label}</text>
                      {gate.isRecommended && (
                        <circle cx={x + 7} cy={y - 7} r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                      )}
                    </g>
                  );
                })}

                {/* Food Stalls */}
                {(foodStalls || []).slice(0, 6).map((stall) => {
                  const x = stall.mapX * 4;
                  const y = stall.mapY * 4;
                  return (
                    <g key={stall.id} onClick={() => setSelectedZone(stall.id)} style={{ cursor: 'pointer' }}>
                      <rect x={x - 6} y={y - 6} width="12" height="12" rx="2"
                        fill="rgba(245,158,11,0.8)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize="7">🍴</text>
                    </g>
                  );
                })}

                {/* Restrooms */}
                {(restrooms || []).map((room) => {
                  const x = room.mapX * 4;
                  const y = room.mapY * 4;
                  const color = room.status === 'LOW' ? '#10b981' : room.status === 'HIGH' ? '#ef4444' : '#f59e0b';
                  return (
                    <g key={room.id} onClick={() => setSelectedZone(room.id)} style={{ cursor: 'pointer' }}>
                      <rect x={x - 5} y={y - 5} width="10" height="10" rx="2" fill={color} opacity="0.7" />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="6">WC</text>
                    </g>
                  );
                })}

                {/* Landmarks */}
                {LANDMARKS.slice(0, 5).map((lm) => {
                  const x = lm.mapX * 4;
                  const y = lm.mapY * 4;
                  return (
                    <text key={lm.id} x={x} y={y} textAnchor="middle" fontSize="11"
                      style={{ pointerEvents: 'none' }}>{lm.icon}</text>
                  );
                })}

                {/* Route Overlay */}
                {route && route.length >= 2 && (() => {
                  const pts = route.map(nodeId => {
                    const gate = gates?.find(g => g.id === nodeId);
                    if (gate) return { x: gate.mapX * 4, y: gate.mapY * 4 };
                    const room = restrooms?.find(r => r.id === nodeId);
                    if (room) return { x: room.mapX * 4, y: room.mapY * 4 };
                    const food = foodStalls?.find(f => f.id === nodeId);
                    if (food) return { x: food.mapX * 4, y: food.mapY * 4 };
                    // Sections approximate to center
                    return { x: 200, y: 200 };
                  }).filter(Boolean);
                  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  return (
                    <path d={d} fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray="6,3" opacity="0.9"
                      style={{ animation: 'none' }} />
                  );
                })()}

                {/* Center text */}
                <text x="200" y="198" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="36" fontWeight="900">IQ</text>
              </svg>
            </div>

            {/* Map Legend */}
            <div className={styles.mapFooter}>
              <span className={styles.mapKey}><span className={styles.gateKey} /> Gates (A–H)</span>
              <span className={styles.mapKey}><span className={styles.foodKey} /> Food Stalls</span>
              <span className={styles.mapKey}><span className={styles.restroomKey} /> Restrooms</span>
            </div>
          </div>

          {/* Selected Zone Detail */}
          {selectedZone && (() => {
            const gate = gates?.find(g => g.id === selectedZone);
            const room = restrooms?.find(r => r.id === selectedZone);
            const stall = foodStalls?.find(f => f.id === selectedZone);
            const item = gate || room || stall;
            if (!item) return null;
            return (
              <div className={`card ${styles.zoneDetail}`}>
                <div className={styles.zoneDetailHeader}>
                  <h3 className={styles.zoneDetailName}>{item.name}</h3>
                  <button onClick={() => setSelectedZone(null)} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>✕ Close</button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <WaitTimeBadge minutes={item.waitTime} />
                  <StatusBadge status={item.status} />
                  {gate && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{gate.location}</span>}
                </div>
                {item.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{item.description}</p>}
                <button className="btn btn-primary" style={{ marginTop: '0.75rem', fontSize: 'var(--text-xs)' }}
                  onClick={() => { setToNode(selectedZone); setSelectedZone(null); }}>
                  Navigate Here →
                </button>
              </div>
            );
          })()}
        </div>

        {/* Right: Route Planner + Quick Nav */}
        <div className={styles.sidePanel}>
          {/* Recommended Section */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>⭐ Best Right Now</h2>
            <div className={styles.bestList}>
              <div className={styles.bestItem}>
                <span className={styles.bestIcon}>🚪</span>
                <div className={styles.bestInfo}>
                  <div className={styles.bestLabel}>Fastest Gate</div>
                  <div className={styles.bestName}>{bestGate?.name}</div>
                  <div className={styles.bestMeta}>{bestGate?.location}</div>
                </div>
                <WaitTimeBadge minutes={bestGate?.waitTime || 0} />
              </div>
              <div className={styles.bestItem}>
                <span className={styles.bestIcon}>🚻</span>
                <div className={styles.bestInfo}>
                  <div className={styles.bestLabel}>Nearest Restroom</div>
                  <div className={styles.bestName}>{bestRestroom?.name}</div>
                  <div className={styles.bestMeta}>{bestRestroom?.level}</div>
                </div>
                <WaitTimeBadge minutes={bestRestroom?.waitTime || 0} />
              </div>
              <div className={styles.bestItem}>
                <span className={styles.bestIcon}>🍔</span>
                <div className={styles.bestInfo}>
                  <div className={styles.bestLabel}>Least Crowded Food</div>
                  <div className={styles.bestName}>{bestFood?.name}</div>
                  <div className={styles.bestMeta}>{bestFood?.category}</div>
                </div>
                <WaitTimeBadge minutes={bestFood?.waitTime || 0} />
              </div>
            </div>
          </div>

          {/* Route Planner */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>🗺️ Route Planner</h2>
            <div className={styles.routeForm}>
              <div>
                <label className={styles.routeLabel}>From</label>
                <select className="input" value={fromNode} onChange={e => setFromNode(e.target.value)}
                  style={{ fontSize: 'var(--text-sm)' }}>
                  <option value="">Select starting point...</option>
                  {(gates || []).map(g => (
                    <option key={g.id} value={g.id}>{g.name} — {g.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.routeLabel}>To</label>
                <select className="input" value={toNode} onChange={e => setToNode(e.target.value)}
                  style={{ fontSize: 'var(--text-sm)' }}>
                  <option value="">Select destination...</option>
                  <optgroup label="🚪 Gates">
                    {(gates || []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </optgroup>
                  <optgroup label="🍔 Food Stalls">
                    {(foodStalls || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </optgroup>
                  <optgroup label="🚻 Restrooms">
                    {(restrooms || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleFindRoute}
                disabled={!fromNode || !toNode} style={{ width: '100%' }}>
                Find Best Route →
              </button>
            </div>

            {/* Route Result */}
            {route && (
              <div className={styles.routeResult}>
                <div className={styles.routeResultHeader}>
                  <span>📍 Route Found</span>
                  <span className={styles.routeSteps}>{route.length} stops</span>
                </div>
                <div className={styles.routeStepList}>
                  {route.map((nodeId, i) => (
                    <div key={nodeId} className={styles.routeStep}>
                      <div className={styles.routeStepNum}>{i + 1}</div>
                      <div className={styles.routeStepName}>{getNodeLabel(nodeId)}</div>
                      {i < route.length - 1 && <div className={styles.routeArrow}>↓</div>}
                    </div>
                  ))}
                </div>
                <p className={styles.routeHint}>
                  💡 Estimated walk: ~{route.length * 2}–{route.length * 3} minutes
                </p>
              </div>
            )}

            {route === null && fromNode && toNode && (
              <div className={styles.noRoute}>⚠️ No direct route found between these points.</div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>⚡ Quick Navigate</h2>
            <div className={styles.filterRow}>
              {['all', 'gate', 'food', 'restroom'].map(f => (
                <button key={f} className={`tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)} style={{ flex: 1, padding: '6px', fontSize: 'var(--text-xs)' }}>
                  {f === 'all' ? 'All' : f === 'gate' ? '🚪' : f === 'food' ? '🍔' : '🚻'}
                </button>
              ))}
            </div>
            <div className={styles.nodeList}>
              {filteredNodes.slice(0, 12).map(node => (
                <button key={node.id} className={styles.nodeBtn}
                  onClick={() => { setToNode(node.id); setSelectedZone(node.id); }}>
                  <span>{node.type === 'gate' ? '🚪' : node.type === 'food' ? '🍔' : '🚻'}</span>
                  <span className={styles.nodeBtnLabel}>{node.label}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
