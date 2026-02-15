import React from 'react'
import { IconProps } from './types'

export const IconSupport: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg
        className={`support-solve-icon ${className || ''}`}
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
            <linearGradient id="supportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
            </linearGradient>
        </defs>

        {/* Support Person Bod */}
        <g className="person-group">
            <circle cx="24" cy="16" r="8" className="person-head" fill="rgba(255,255,255,0.1)" />
            <path d="M10 42C10 33.163 16.268 26 24 26C31.732 26 38 33.163 38 42" className="person-body" fill="rgba(255,255,255,0.1)" />

            {/* Headset */}
            <path d="M16 16C16 11.58 19.58 8 24 8C28.42 8 32 11.58 32 16" className="headset-band" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <rect x="14" y="14" width="3" height="6" rx="1" fill="currentColor" className="earpad-l" />
            <rect x="31" y="14" width="3" height="6" rx="1" fill="currentColor" className="earpad-r" />
            <path d="M32 18L36 21" stroke="currentColor" strokeWidth="1.5" className="mic-arm" />
        </g>

        {/* Solving Bubble */}
        <g className="bubble-group">
            <path
                d="M34 8H42C43.1 8 44 8.9 44 10V18C44 19.1 43.1 20 42 20H38L34 24V20H34C32.9 20 32 19.1 32 18V10C32 8.9 32.9 8 34 8Z"
                className="solve-bubble"
                fill="white"
                stroke="#000000"
                strokeWidth="1.5"
            />

            {/* Question Mark (Problem) */}
            <text x="38" y="16" className="problem-mark" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#000000" stroke="none">?</text>

            {/* Check Mark (Solution) */}
            <path d="M35.5 14L37.5 16L40.5 12" className="solution-mark" stroke="#00c853" strokeWidth="2" fill="none" />
        </g>



        <style>{`
      .support-solve-icon { overflow: visible; }
      
      .person-head, .person-body {
        stroke: currentColor;
        stroke-opacity: 0.6;
      }

      .bubble-group {
        animation: bubbleFloat 4s infinite ease-in-out;
      }
      
      @keyframes bubbleFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(2px, -3px); }
      }

      .problem-mark {
        animation: problemFade 4s infinite ease-in-out;
        transform-origin: 38px 14px;
        transform-box: fill-box;
      }

      @keyframes problemFade {
        0%, 30% { opacity: 1; }
        40%, 90% { opacity: 0; }
        100% { opacity: 1; }
      }

      .solution-mark {
        stroke-dasharray: 10;
        stroke-dashoffset: 10;
        animation: solutionShow 4s infinite ease-in-out;
      }

      @keyframes solutionShow {
        0%, 35% { stroke-dashoffset: 10; opacity: 0; }
        45%, 85% { stroke-dashoffset: 0; opacity: 1; }
        95%, 100% { stroke-dashoffset: 10; opacity: 0; }
      }

      .solve-bubble {
        animation: bubbleColor 4s infinite ease-in-out;
      }

      @keyframes bubbleColor {
        0%, 35% { fill: white; stroke: #000000; }
        45%, 85% { fill: rgba(0, 200, 83, 0.1); stroke: #00c853; }
        95%, 100% { fill: white; stroke: currentColor; }
      }

      .mic-arm {
        animation: micTalk 0.5s infinite alternate ease-in-out;
        transform-origin: 32px 18px;
      }

      @keyframes micTalk {
        from { transform: rotate(0deg); }
        to { transform: rotate(5deg); }
      }
    `}</style>
    </svg>
)
