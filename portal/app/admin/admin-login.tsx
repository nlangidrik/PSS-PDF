"use client"

import { useEffect, useState, useRef } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { PssLogo } from "@/components/pss-logo"
import { APP_NAME, APP_TAGLINE } from "@/lib/brand"

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only paint; particles touch the DOM after mount
    setMounted(true)
    const container = particlesRef.current
    if (!container) return
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div")
      const size = 1 + Math.random() * 2
      p.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(140,200,255,0.4);
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        animation: floatUp ${10 + Math.random() * 14}s ${Math.random() * 12}s linear infinite;
      `
      container.appendChild(p)
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: searchParams.get("callbackUrl") || "/dashboard/admin"
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      window.location.assign(result?.url || "/dashboard/admin")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .admin-root {
          min-height: 100vh;
          background: #0b1628;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .admin-stick-chart {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.07;
          pointer-events: none;
        }

        .admin-glow-center {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,95,200,0.2) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: breathe 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .admin-glow-left {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20,140,100,0.15) 0%, transparent 70%);
          top: 20%;
          left: -100px;
          animation: breathe2 8s ease-in-out 1s infinite alternate;
          pointer-events: none;
        }

        .admin-glow-right {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,95,200,0.15) 0%, transparent 70%);
          bottom: 20%;
          right: -80px;
          animation: breathe2 7s ease-in-out 2s infinite alternate;
          pointer-events: none;
        }

        @keyframes breathe {
          from { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
          to   { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }
        @keyframes breathe2 {
          from { transform: scale(1); opacity: 0.6; }
          to   { transform: scale(1.2); opacity: 1; }
        }

        @keyframes floatUp {
          from { transform: translateY(110vh); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          to   { transform: translateY(-110vh); opacity: 0; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .admin-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(15, 27, 56, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56, 140, 220, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(30, 95, 200, 0.1);
          overflow: hidden;
          animation: fadeUp 0.6s ease both;
        }

        .admin-header {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.4) 0%, rgba(37, 99, 235, 0.3) 100%);
          border-bottom: 1px solid rgba(56, 140, 220, 0.15);
          padding: 36px 32px 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .admin-header::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .admin-logo-wrap {
          position: relative;
          width: 140px;
          height: 120px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-logo-ring-1 {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1px solid rgba(56, 140, 220, 0.3);
          animation: spin 18s linear infinite;
        }

        .admin-logo-ring-2 {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 1px dashed rgba(56, 140, 220, 0.15);
          animation: spin 28s linear infinite reverse;
        }

        .admin-logo-circle {
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: blink 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .admin-school-name {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .admin-school-text {
          color: #8dd0f5;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .admin-title {
          color: #f0f4ff;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 6px;
          position: relative;
          z-index: 1;
          letter-spacing: -0.02em;
        }

        .admin-tagline {
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          margin: 8px 0 0;
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 40rem) {
          .admin-tagline { display: none; }
        }

        .admin-subtitle {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.05em;
          position: relative;
          z-index: 1;
        }

        .admin-flow-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .admin-flow-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
          height: 1px;
        }

        .admin-flow-line-1 {
          top: 25%;
          width: 60%;
          left: -60%;
          animation: flowRight 3s ease-in-out infinite;
        }

        .admin-flow-line-2 {
          top: 50%;
          width: 80%;
          left: -80%;
          animation: flowRight 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .admin-flow-line-3 {
          top: 75%;
          width: 50%;
          left: -50%;
          animation: flowRight 3.5s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes flowRight {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(250%); opacity: 0; }
        }

        .admin-form {
          padding: 32px;
        }

        .admin-field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .admin-input-wrap {
          position: relative;
          margin-bottom: 20px;
        }

        .admin-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s;
          pointer-events: none;
        }

        .admin-input-wrap:focus-within .admin-input-icon {
          color: #60a5fa;
        }

        .admin-input {
          width: 100%;
          height: 50px;
          padding: 0 14px 0 44px;
          background: rgba(30, 41, 59, 0.9);
          border: 1.5px solid rgba(56, 140, 220, 0.15);
          border-radius: 12px;
          color: #f0f4ff;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }

        .admin-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .admin-input:hover {
          border-color: rgba(56, 140, 220, 0.3);
        }

        .admin-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .admin-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 6px;
        }

        .admin-eye-btn:hover {
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.05);
        }

        .admin-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          margin-bottom: 20px;
          animation: shake 0.5s ease-in-out;
        }

        .admin-error-icon {
          width: 32px;
          height: 32px;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-error-text {
          color: #fca5a5;
          font-size: 13px;
          font-weight: 500;
        }

        .admin-submit-btn {
          width: 100%;
          height: 50px;
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          font-family: 'Inter', sans-serif;
        }

        .admin-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }

        .admin-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .admin-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .admin-footer {
          padding: 20px 32px 24px;
          border-top: 1px solid rgba(56, 140, 220, 0.1);
          text-align: center;
        }

        .admin-footer-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .particles-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div className="admin-root">
        {/* Marshallese Stick Chart Background */}
        <svg className="admin-stick-chart" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
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

        {/* Glow Effects */}
        <div className="admin-glow-center" />
        <div className="admin-glow-left" />
        <div className="admin-glow-right" />
        <div className="particles-layer" ref={particlesRef} />

        {/* Login Card */}
        <div className="admin-card">
          {/* Header */}
          <div className="admin-header">
            {/* Flow Lines */}
            <div className="admin-flow-lines">
              <div className="admin-flow-line admin-flow-line-1" />
              <div className="admin-flow-line admin-flow-line-2" />
              <div className="admin-flow-line admin-flow-line-3" />
            </div>

            <div className="admin-logo-wrap">
              <div className="admin-logo-ring-1" />
              <div className="admin-logo-ring-2" />
              <div className="admin-logo-circle">
                <PssLogo showText={false} height={88} />
              </div>
            </div>

            <div className="admin-school-name">
              <span className="admin-live-dot" />
              <span className="admin-school-text">RMI Public School System</span>
              <span className="admin-live-dot" />
            </div>

            <h1 className="admin-title">{APP_NAME}</h1>
            <p className="admin-tagline">{APP_TAGLINE}</p>
            <p className="admin-subtitle">Administrator sign-in</p>
          </div>

          {/* Form */}
          <div className="admin-form">
            <form onSubmit={onSubmit}>
              {/* Email Field */}
              <div className="admin-field-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span>Email Address</span>
              </div>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="admin-input"
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="admin-field-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Password</span>
              </div>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="admin-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-eye-btn"
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="admin-error">
                  <div className="admin-error-icon">
                    <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="admin-error-text">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="admin-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="admin-spinner" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="admin-footer">
            <div className="admin-footer-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Protected by PSS IT Security</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
