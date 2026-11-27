"use client";

import { signIn } from "next-auth/react";
import { useEffect, useRef } from "react";
import { PssLogo } from "@/components/pss-logo";
import { APP_NAME, ORG_NAME } from "@/lib/brand";

export default function LandingClient() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("div");
      const size = 1 + Math.random() * 2;
      p.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(140,200,255,0.45);
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        animation: floatUp ${10 + Math.random() * 14}s ${Math.random() * 12}s linear infinite;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        .landing-root {
          min-height: 100vh;
          background: #0b1628;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .stick-chart {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.07;
          pointer-events: none;
        }

        .glow-center {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,95,200,0.22) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: breathe 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .glow-tl {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(20,140,100,0.1);
          top: -80px;
          left: -60px;
          animation: breathe2 8s ease-in-out 1s infinite alternate;
          pointer-events: none;
        }

        .glow-br {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(30,95,200,0.1);
          bottom: -60px;
          right: -40px;
          animation: breathe2 7s ease-in-out 2s infinite alternate;
          pointer-events: none;
        }

        @keyframes breathe {
          from { transform: translate(-50%,-50%) scale(1); }
          to   { transform: translate(-50%,-50%) scale(1.12); }
        }
        @keyframes breathe2 {
          from { transform: scale(1); opacity: 0.8; }
          to   { transform: scale(1.15); opacity: 1; }
        }

        .landing-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(56,140,220,0.12);
          border: 1px solid rgba(56,140,220,0.28);
          color: #8dd0f5;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 999px;
          margin-bottom: 30px;
          animation: fadeDown 0.7s ease both;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: blink 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        .logo-wrap {
          position: relative;
          width: 112px;
          height: 112px;
          margin-bottom: 28px;
          animation: fadeDown 0.6s 0.05s ease both;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-ring-outer {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1px solid rgba(56,140,220,0.22);
          animation: spin 18s linear infinite;
        }

        .logo-ring-dashed {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 1px dashed rgba(56,140,220,0.1);
          animation: spin 28s linear infinite reverse;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .logo-circle {
          width: 108px;
          height: 108px;
          border-radius: 50%;
          border: 2px solid rgba(56,140,220,0.38);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15,27,56,0.6);
          position: relative;
          z-index: 1;
        }

        .landing-h1 {
          color: #f0f4ff;
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 8px;
          text-align: center;
          animation: fadeUp 0.6s 0.1s ease both;
          letter-spacing: -0.02em;
        }

        .landing-subtitle {
          color: rgba(255,255,255,0.38);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 36px;
          animation: fadeUp 0.6s 0.18s ease both;
        }

        .login-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #1a56c4;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          padding: 13px 40px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          animation: fadeUp 0.6s 0.26s ease both;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
          font-family: 'Inter', sans-serif;
        }

        .login-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(26,86,196,0.45);
        }

        .login-btn:active { transform: translateY(0); }

        .stats-row {
          display: flex;
          gap: 28px;
          margin-top: 44px;
          animation: fadeUp 0.6s 0.34s ease both;
        }

        .stat { text-align: center; }

        .stat-num {
          color: #e2eaff;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .stat-label {
          color: rgba(255,255,255,0.3);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .stat-divider {
          width: 1px;
          height: 30px;
          background: rgba(255,255,255,0.08);
          align-self: center;
        }

        .particles-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes floatUp {
          from { transform: translateY(110vh); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          to   { transform: translateY(-110vh); opacity: 0; }
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="landing-root">

        {/* Marshallese stick chart background */}
        <svg className="stick-chart" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <g stroke="white" strokeLinecap="round" fill="none">
            <line x1="400" y1="40" x2="400" y2="580" strokeWidth="1.2"/>
            <line x1="60" y1="310" x2="740" y2="310" strokeWidth="1.2"/>
            <line x1="120" y1="80" x2="680" y2="540" strokeWidth="1"/>
            <line x1="680" y1="80" x2="120" y2="540" strokeWidth="1"/>
            <ellipse cx="400" cy="310" rx="60" ry="60" strokeWidth="0.8"/>
            <ellipse cx="400" cy="310" rx="110" ry="110" strokeWidth="0.8"/>
            <ellipse cx="400" cy="310" rx="165" ry="165" strokeWidth="0.8"/>
            <ellipse cx="400" cy="310" rx="225" ry="225" strokeWidth="0.7"/>
            <ellipse cx="400" cy="310" rx="290" ry="290" strokeWidth="0.6"/>
            <path d="M 200 40 Q 310 130 400 160 Q 490 190 560 80" strokeWidth="0.7"/>
            <path d="M 160 60 Q 280 170 400 200 Q 520 230 600 60" strokeWidth="0.6"/>
            <path d="M 200 580 Q 310 490 400 460 Q 490 430 560 540" strokeWidth="0.7"/>
            <path d="M 160 560 Q 280 450 400 420 Q 520 390 600 550" strokeWidth="0.6"/>
            <path d="M 60 150 Q 160 230 180 310 Q 200 390 80 470" strokeWidth="0.7"/>
            <path d="M 40 180 Q 150 260 170 310 Q 190 360 60 460" strokeWidth="0.6"/>
            <path d="M 740 150 Q 640 230 620 310 Q 600 390 720 470" strokeWidth="0.7"/>
            <path d="M 760 180 Q 650 260 630 310 Q 610 360 740 460" strokeWidth="0.6"/>
            <line x1="400" y1="310" x2="220" y2="120" strokeWidth="0.9"/>
            <line x1="400" y1="310" x2="580" y2="120" strokeWidth="0.9"/>
            <line x1="400" y1="310" x2="220" y2="500" strokeWidth="0.9"/>
            <line x1="400" y1="310" x2="580" y2="500" strokeWidth="0.9"/>
            <line x1="400" y1="310" x2="160" y2="310" strokeWidth="0.8"/>
            <line x1="400" y1="310" x2="640" y2="310" strokeWidth="0.8"/>
            <line x1="400" y1="310" x2="400" y2="130" strokeWidth="0.8"/>
            <line x1="400" y1="310" x2="400" y2="490" strokeWidth="0.8"/>
            <line x1="220" y1="120" x2="580" y2="120" strokeWidth="0.7"/>
            <line x1="220" y1="500" x2="580" y2="500" strokeWidth="0.7"/>
            <line x1="160" y1="160" x2="160" y2="460" strokeWidth="0.7"/>
            <line x1="640" y1="160" x2="640" y2="460" strokeWidth="0.7"/>
            <line x1="220" y1="120" x2="160" y2="310" strokeWidth="0.6"/>
            <line x1="580" y1="120" x2="640" y2="310" strokeWidth="0.6"/>
            <line x1="220" y1="500" x2="160" y2="310" strokeWidth="0.6"/>
            <line x1="580" y1="500" x2="640" y2="310" strokeWidth="0.6"/>
            <line x1="220" y1="120" x2="400" y2="130" strokeWidth="0.6"/>
            <line x1="580" y1="120" x2="400" y2="130" strokeWidth="0.6"/>
            <line x1="220" y1="500" x2="400" y2="490" strokeWidth="0.6"/>
            <line x1="580" y1="500" x2="400" y2="490" strokeWidth="0.6"/>
            <line x1="80" y1="80" x2="220" y2="120" strokeWidth="0.6"/>
            <line x1="720" y1="80" x2="580" y2="120" strokeWidth="0.6"/>
            <line x1="80" y1="540" x2="220" y2="500" strokeWidth="0.6"/>
            <line x1="720" y1="540" x2="580" y2="500" strokeWidth="0.6"/>
            <line x1="80" y1="80" x2="400" y2="40" strokeWidth="0.6"/>
            <line x1="720" y1="80" x2="400" y2="40" strokeWidth="0.6"/>
            <line x1="80" y1="540" x2="400" y2="580" strokeWidth="0.6"/>
            <line x1="720" y1="540" x2="400" y2="580" strokeWidth="0.6"/>
            <line x1="80" y1="80" x2="60" y2="310" strokeWidth="0.6"/>
            <line x1="80" y1="540" x2="60" y2="310" strokeWidth="0.6"/>
            <line x1="720" y1="80" x2="740" y2="310" strokeWidth="0.6"/>
            <line x1="720" y1="540" x2="740" y2="310" strokeWidth="0.6"/>
            <circle cx="400" cy="310" r="5" fill="white" stroke="none"/>
            <circle cx="220" cy="120" r="4" fill="white" stroke="none"/>
            <circle cx="580" cy="120" r="4" fill="white" stroke="none"/>
            <circle cx="220" cy="500" r="4" fill="white" stroke="none"/>
            <circle cx="580" cy="500" r="4" fill="white" stroke="none"/>
            <circle cx="160" cy="310" r="3.5" fill="white" stroke="none"/>
            <circle cx="640" cy="310" r="3.5" fill="white" stroke="none"/>
            <circle cx="400" cy="130" r="3.5" fill="white" stroke="none"/>
            <circle cx="400" cy="490" r="3.5" fill="white" stroke="none"/>
            <circle cx="80" cy="80" r="3" fill="white" stroke="none"/>
            <circle cx="720" cy="80" r="3" fill="white" stroke="none"/>
            <circle cx="80" cy="540" r="3" fill="white" stroke="none"/>
            <circle cx="720" cy="540" r="3" fill="white" stroke="none"/>
          </g>
        </svg>

        <div className="glow-center" />
        <div className="glow-tl" />
        <div className="glow-br" />
        <div className="particles-layer" ref={particlesRef} />

        <div className="landing-content">
          <div className="badge">
            <span className="live-dot" />
            {ORG_NAME}
          </div>

          <div className="logo-wrap">
            <div className="logo-ring-outer" />
            <div className="logo-ring-dashed" />
            <div className="logo-circle">
              <PssLogo showText={false} size={96} />
            </div>
          </div>

          <h1 className="landing-h1">{APP_NAME}</h1>
          <p className="landing-subtitle">PDF editor for PSS staff</p>

          <button
            className="login-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign in with Google — PSS account
          </button>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-num">Pages</div>
              <div className="stat-label">Arrange</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-num">Sign</div>
              <div className="stat-label">And edit</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-num">Redact</div>
              <div className="stat-label">Safely</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
