import React from 'react'
import { IconProps } from './types'

export const IconLock: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg
        className={`security-lock-icon ${className || ''}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <defs>
            <linearGradient id="lockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
            </linearGradient>
        </defs>

        {/* Shield background (subtle) */}
        <path d="M24 4C14 4 6 8 6 18C6 28 14 38 24 44C34 38 42 28 42 18C42 8 34 4 24 4Z"
            className="shield-backing"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="none"
        />

        {/* Lock Shackle */}
        <path d="M16 22V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V22"
            className="lock-shackle"
            fill="none"
            strokeWidth="3"
        />

        {/* Lock Body */}
        <rect x="10" y="22" width="28" height="20" rx="4"
            className="lock-body"
            fill="url(#lockGradient)"
            stroke="none"
        />

        {/* Keyhole detail */}
        <g className="keyhole-group">
            <circle cx="24" cy="32" r="3" fill="var(--bg-primary, #000)" stroke="none" />
            <path d="M24 35L24 38" stroke="var(--bg-primary, #000)" strokeWidth="2" />
        </g>

        {/* Pulse effect when locked */}
        <circle cx="24" cy="32" r="15" className="lock-pulse" stroke="currentColor" strokeWidth="1" opacity="0" />

        {/* "Threat" particles */}
        <circle cx="44" cy="10" r="1.5" className="threat particle-1" fill="currentColor" />
        <circle cx="4" cy="15" r="1.5" className="threat particle-2" fill="currentColor" />
        <circle cx="40" cy="35" r="1.5" className="threat particle-3" fill="currentColor" />

        <style>{`
      .security-lock-icon { overflow: visible; }
      
      .lock-shackle {
        animation: shackleMove 3s infinite ease-in-out;
        transform-origin: center;
      }
      
      @keyframes shackleMove {
        0%, 15% { transform: translateY(-4px); }
        30%, 75% { transform: translateY(0); }
        90%, 100% { transform: translateY(-4px); }
      }
      
      .lock-body {
        stroke: none;
      }

      .lock-pulse {
        animation: lockPulseAnim 3s infinite ease-in-out;
        transform-origin: 24px 32px;
      }

      @keyframes lockPulseAnim {
        0%, 25% { transform: scale(0.5); opacity: 0; }
        35% { transform: scale(1); opacity: 0.5; }
        50%, 100% { transform: scale(1.5); opacity: 0; }
      }

      .threat {
        opacity: 0;
      }

      .particle-1 { animation: threatMove1 3s infinite linear; }
      .particle-2 { animation: threatMove2 3s infinite linear; animation-delay: 0.5s; }
      .particle-3 { animation: threatMove3 3s infinite linear; animation-delay: 1.2s; }

      @keyframes threatMove1 {
        0% { transform: translate(0, 0); opacity: 0; }
        10% { opacity: 0.8; }
        30% { transform: translate(-15px, 12px); opacity: 0.8; }
        31% { transform: translate(-16px, 13px); opacity: 0; }
        100% { opacity: 0; }
      }

      @keyframes threatMove2 {
        0% { transform: translate(0, 0); opacity: 0; }
        10% { opacity: 0.8; }
        40% { transform: translate(15px, 10px); opacity: 0.8; }
        41% { transform: translate(16px, 11px); opacity: 0; }
        100% { opacity: 0; }
      }

      @keyframes threatMove3 {
        0% { transform: translate(0, 0); opacity: 0; }
        10% { opacity: 0.8; }
        50% { transform: translate(-12px, -10px); opacity: 0.8; }
        51% { transform: translate(-13px, -11px); opacity: 0; }
        100% { opacity: 0; }
      }
      
      .shield-backing {
        animation: shieldGlow 3s infinite ease-in-out;
      }
      
      @keyframes shieldGlow {
        0%, 25% { fill-opacity: 0.05; }
        35% { fill-opacity: 0.15; }
        50%, 100% { fill-opacity: 0.05; }
      }
    `}</style>
    </svg>
)
