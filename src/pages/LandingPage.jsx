import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [phase, setPhase] = useState("intro");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Particles (energy sparks) ---
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2.5 + 0.5,
      hue: Math.random() > 0.5 ? 200 : 280,
      life: Math.random(),
    }));

    // --- Cricket ball ---
    const ball = {
      x: window.innerWidth * 0.15,
      y: window.innerHeight * 0.35,
      vx: 6, vy: -7,
      trail: [],
    };

    // --- Batter character (stylized) ---
    const drawBatter = (ctx, w, h, frame) => {
      const cx = w * 0.72;
      const cy = h * 0.55;
      const pulse = Math.sin(frame * 0.04) * 3;

      // Glow aura
      const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      aura.addColorStop(0, "rgba(0,180,255,0.18)");
      aura.addColorStop(0.5, "rgba(120,0,255,0.08)");
      aura.addColorStop(1, "transparent");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Shadow on ground
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#0a0020";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 120, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Legs
      ctx.save();
      ctx.strokeStyle = "#1a1a4e";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 50);
      ctx.lineTo(cx - 25, cy + 115);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 50);
      ctx.lineTo(cx + 20, cy + 115);
      ctx.stroke();
      ctx.restore();

      // Pads (leg guards)
      ctx.save();
      ctx.fillStyle = "#e8e0c8";
      ctx.beginPath();
      ctx.roundRect(cx - 38, cy + 60, 22, 55, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(cx + 10, cy + 60, 22, 55, 6);
      ctx.fill();
      ctx.restore();

      // Body / jersey
      const bodyGrad = ctx.createLinearGradient(cx - 35, cy - 30, cx + 35, cy + 50);
      bodyGrad.addColorStop(0, "#e87820");
      bodyGrad.addColorStop(0.5, "#c45a10");
      bodyGrad.addColorStop(1, "#8b3a08");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 35, cy - 30, 70, 85, [8, 8, 0, 0]);
      ctx.fill();

      // Jersey number glow
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("18", cx, cy + 20);
      ctx.restore();

      // Cape / scarf
      ctx.save();
      ctx.strokeStyle = "#cc1020";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 20);
      ctx.bezierCurveTo(
        cx - 40, cy - 10 + pulse,
        cx - 60, cy + 20 + pulse,
        cx - 70, cy + 50 + pulse * 1.5
      );
      ctx.stroke();
      ctx.restore();

      // Helmet
      const helmGrad = ctx.createRadialGradient(cx - 8, cy - 70, 5, cx, cy - 60, 40);
      helmGrad.addColorStop(0, "#3a3a6e");
      helmGrad.addColorStop(1, "#12122e");
      ctx.fillStyle = helmGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 60, 38, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#12122e";
      ctx.fillRect(cx - 38, cy - 60, 76, 18);

      // Visor glow
      const visor = ctx.createLinearGradient(cx - 30, cy - 55, cx + 30, cy - 45);
      visor.addColorStop(0, "rgba(0,200,255,0.9)");
      visor.addColorStop(0.5, "rgba(180,100,255,0.9)");
      visor.addColorStop(1, "rgba(0,200,255,0.9)");
      ctx.fillStyle = visor;
      ctx.beginPath();
      ctx.roundRect(cx - 28, cy - 56, 56, 14, 4);
      ctx.fill();

      // Visor shimmer
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(frame * 0.08) * 0.3;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(cx - 22, cy - 54, 20, 4, 2);
      ctx.fill();
      ctx.restore();

      // Eyes
      ctx.fillStyle = `rgba(0,220,255,${0.7 + Math.sin(frame * 0.06) * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 44, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy - 44, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bat arm
      ctx.save();
      ctx.strokeStyle = "#c45a10";
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 10);
      ctx.lineTo(cx - 70, cy - 60 + pulse * 2);
      ctx.stroke();
      ctx.restore();

      // Bat
      ctx.save();
      const batGrad = ctx.createLinearGradient(cx - 90, cy - 100, cx - 55, cy - 40);
      batGrad.addColorStop(0, "#d4a820");
      batGrad.addColorStop(0.5, "#8b6810");
      batGrad.addColorStop(1, "#5a4008");
      ctx.fillStyle = batGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 100 + pulse, cy - 110 + pulse * 2, 18, 80, 5);
      ctx.fill();
      // Bat glow edge
      ctx.strokeStyle = "rgba(0,200,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Tech arm / cyber arm (left)
      const armGrad = ctx.createLinearGradient(cx + 30, cy - 10, cx + 90, cy + 20);
      armGrad.addColorStop(0, "#5a7aaa");
      armGrad.addColorStop(1, "#2a4a7a");
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.roundRect(cx + 28, cy - 15, 65, 30, 8);
      ctx.fill();

      // Cyber arm glow circles
      for (let i = 0; i < 3; i++) {
        const glow = 0.5 + Math.sin(frame * 0.07 + i * 1.2) * 0.4;
        ctx.save();
        ctx.globalAlpha = glow;
        const cg = ctx.createRadialGradient(cx + 45 + i * 16, cy - 1, 1, cx + 45 + i * 16, cy - 1, 9);
        cg.addColorStop(0, "#00cfff");
        cg.addColorStop(1, "transparent");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx + 45 + i * 16, cy - 1, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // --- Pitch ---
    const drawPitch = (ctx, w, h) => {
      // Outer grass glow
      const grassGlow = ctx.createRadialGradient(w / 2, h * 0.7, 50, w / 2, h * 0.7, w * 0.55);
      grassGlow.addColorStop(0, "rgba(10,80,30,0.5)");
      grassGlow.addColorStop(0.6, "rgba(5,40,15,0.3)");
      grassGlow.addColorStop(1, "transparent");
      ctx.fillStyle = grassGlow;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.7, w * 0.55, h * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pitch strip
      const pitchGrad = ctx.createLinearGradient(w / 2 - 30, h * 0.45, w / 2 + 30, h * 0.85);
      pitchGrad.addColorStop(0, "#b8a878");
      pitchGrad.addColorStop(1, "#8a7a58");
      ctx.fillStyle = pitchGrad;
      ctx.beginPath();
      ctx.roundRect(w / 2 - 28, h * 0.44, 56, h * 0.32, 4);
      ctx.fill();

      // Crease lines
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      [h * 0.5, h * 0.72].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(w / 2 - 42, y);
        ctx.lineTo(w / 2 + 42, y);
        ctx.stroke();
      });

      // Stumps
      [[w / 2 - 14, h * 0.48], [w / 2, h * 0.48], [w / 2 + 14, h * 0.48]].forEach(([sx, sy]) => {
        ctx.fillStyle = "#f5c518";
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 8;
        ctx.fillRect(sx - 2, sy, 4, 22);
        ctx.shadowBlur = 0;
      });

      // Bails
      ctx.fillStyle = "#f5c518";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 6;
      ctx.fillRect(w / 2 - 16, h * 0.48 - 3, 32, 4);
      ctx.shadowBlur = 0;
    };

    // --- Crowd wave ---
    const drawCrowd = (ctx, w, h, frame) => {
      const rows = 6;
      const cols = 40;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wave = Math.sin(frame * 0.04 + c * 0.35 + r * 0.8) * 0.5 + 0.5;
          const x = (c / cols) * w + (r % 2 ? 10 : 0);
          const y = h * 0.06 + r * 20 + wave * 10;
          const hue = (c * 9 + r * 40 + frame * 0.5) % 360;
          ctx.globalAlpha = 0.55 + wave * 0.35;
          ctx.fillStyle = `hsl(${hue},80%,60%)`;
          ctx.beginPath();
          ctx.arc(x, y, 5 + wave * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    // --- Floodlights ---
    const drawFloodlights = (ctx, w, h, frame) => {
      const lights = [
        { x: w * 0.05, y: h * 0.2 },
        { x: w * 0.95, y: h * 0.2 },
        { x: w * 0.03, y: h * 0.55 },
        { x: w * 0.97, y: h * 0.55 },
      ];
      lights.forEach(({ x, y }) => {
        const pulse = 0.5 + Math.sin(frame * 0.025 + x) * 0.2;
        ctx.save();
        ctx.globalAlpha = pulse * 0.12;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 220);
        g.addColorStop(0, "#fffbe0");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // pole
        ctx.strokeStyle = "#3a3a5a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x < w / 2 ? x + 20 : x - 20, h);
        ctx.stroke();

        // lamp
        ctx.fillStyle = `rgba(255,245,200,${0.7 + pulse * 0.3})`;
        ctx.shadowColor = "#fffbe0";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    // --- Neon grid floor ---
    const drawNeonFloor = (ctx, w, h) => {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#0088ff";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const x = (i / 12) * w;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.75);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
      }
      for (let j = 0; j < 6; j++) {
        const y = h * 0.75 + (j / 6) * h * 0.25;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    // --- Ball ---
    const drawBall = (ctx, b) => {
      b.trail.forEach((t, i) => {
        const a = (i / b.trail.length) * 0.5;
        const r = 8 * (i / b.trail.length);
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,60,60,${a})`;
        ctx.fill();
      });

      const g = ctx.createRadialGradient(b.x - 4, b.y - 4, 1, b.x, b.y, 12);
      g.addColorStop(0, "#ff6060");
      g.addColorStop(0.5, "#cc1010");
      g.addColorStop(1, "#600000");
      ctx.fillStyle = g;
      ctx.shadowColor = "#ff3030";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(255,200,200,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 12, 0.3, Math.PI - 0.3);
      ctx.stroke();
    };

    // --- Energy sparks ---
    const drawParticles = (ctx, w, h, frame) => {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.005;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const a = Math.abs(Math.sin(p.life * 2)) * 0.7;
        ctx.globalAlpha = a;
        ctx.fillStyle = `hsl(${p.hue + frame * 0.3},100%,70%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      frame++;

      // Deep dark background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
      bg.addColorStop(0, "#0d0820");
      bg.addColorStop(0.5, "#080414");
      bg.addColorStop(1, "#040210");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawNeonFloor(ctx, w, h);
      drawFloodlights(ctx, w, h, frame);
      drawCrowd(ctx, w, h, frame);
      drawPitch(ctx, w, h);
      drawParticles(ctx, w, h, frame);
      drawBatter(ctx, w, h, frame);

      // Ball physics
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 22) ball.trail.shift();
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vy += 0.13;
      if (ball.y > h * 0.78) { ball.y = h * 0.78; ball.vy *= -0.7; }
      if (ball.x > w + 30) { ball.x = -20; ball.vy = -7; ball.vx = 5 + Math.random() * 3; }
      if (ball.x < -30) ball.vx = Math.abs(ball.vx);

      drawBall(ctx, ball);

      // Cinematic vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      if (y > 80) setPhase("reveal");
      if (y > 240) setPhase("done");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-root">
      <canvas ref={canvasRef} className="lp-canvas" />

      <div className="lp-overlay" style={{ opacity: Math.min(scrollY / 200, 1) }} />

      {/* Neon top bar */}
      <div className="lp-topbar">
        <span className="lp-logo">Stadium<span>IQ</span></span>
        <div className="lp-topbar-right">
          <span className="lp-live-dot" />
          <span className="lp-live-text">LIVE</span>
        </div>
      </div>

      {/* Hero */}
      <section className="lp-hero">
        <div
          className="lp-hero-content"
          style={{
            transform: `translateY(${-scrollY * 0.35}px)`,
            opacity: 1 - scrollY / 180,
          }}
        >
          <div className="lp-event-tag">🏏 IPL 2025 · MetroArena Stadium</div>
          <h1 className="lp-title">
            <span className="lp-title-line1">STADIUM</span>
            <span className="lp-title-line2">IQ</span>
          </h1>
          <p className="lp-subtitle">
            AI-powered event intelligence.<br />
            Navigate crowds. Skip queues. Win the experience.
          </p>
          <div className="lp-stats-row">
            {[
              { val: "48K", label: "Live Fans" },
              { val: "12s", label: "Update Rate" },
              { val: "AI", label: "Gemini Powered" },
            ].map((s, i) => (
              <div key={i} className="lp-stat">
                <span className="lp-stat-val">{s.val}</span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="lp-scroll-cue">
            <span>Scroll to explore</span>
            <div className="lp-chevron" />
          </div>
        </div>
      </section>

      {/* Features reveal */}
      <section className="lp-reveal">
        <div className={`lp-reveal-inner ${phase !== "intro" ? "lp-show" : ""}`}>
          <h2 className="lp-reveal-title">Your Smart Stadium Companion</h2>
          <div className="lp-features">
            {[
              { icon: "📍", color: "#00cfff", title: "Live Crowd Maps", desc: "Zone-by-zone density heatmaps, updated every 12 seconds." },
              { icon: "⏱️", color: "#a855f7", title: "Queue Intelligence", desc: "Gates, food & restrooms ranked by real-time wait." },
              { icon: "🤖", color: "#f59e0b", title: "Gemini AI Chat", desc: "Ask anything about the venue — get instant answers." },
              { icon: "🗺️", color: "#10b981", title: "BFS Navigator", desc: "Shortest path routing to any point in the stadium." },
            ].map((f, i) => (
              <div
                key={i}
                className="lp-feat-card"
                style={{ "--accent": f.color, transitionDelay: `${i * 0.12}s` }}
              >
                <div className="lp-feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="lp-feat-line" />
              </div>
            ))}
          </div>
          <button className="lp-cta" onClick={() => navigate("/dashboard")}>
            <span className="lp-cta-glow" />
            Enter StadiumIQ →
          </button>
        </div>
      </section>
    </div>
  );
}