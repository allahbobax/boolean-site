import React from 'react'
import { IconProps } from './types'

export const IconDesktopDream: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg className={`dream-interface-svg ${className || ''}`} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="dreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
            </linearGradient>
        </defs>

        {/* Monitor frame */}
        <rect x="6" y="8" width="36" height="26" rx="2" className="monitor-frame" />
        <rect x="8" y="10" width="32" height="22" rx="1" fill="url(#dreamGradient)" />

        <g className="screen-content">
            {/* Floating UI Elements */}
            <g className="window-1-group">
                <rect x="11" y="12" width="10" height="7" rx="1" className="ui-window" />
                <line x1="13" y1="14.5" x2="19" y2="14.5" className="ui-line" opacity="0.5" />
                <line x1="13" y1="16.5" x2="17" y2="16.5" className="ui-line" opacity="0.3" />
            </g>

            <g className="window-2-group">
                <rect x="25" y="13" width="12" height="12" rx="1" className="ui-window" />
                <circle cx="28.5" cy="17" r="1.5" className="ui-accent" />
                <circle cx="33.5" cy="17" r="1.5" className="ui-accent" />
                <rect x="27" y="20.5" width="8" height="1.5" rx="0.5" className="ui-line-full" />
            </g>

            <rect x="11" y="24" width="7" height="3" rx="0.5" className="ui-button" />
            <rect x="19" y="24" width="3" height="3" rx="0.5" className="ui-button-small" />

            {/* Animated Path/Line Chart */}
            <path d="M9 25 Q 15 20, 20 23 T 31 20" className="dream-path" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />

            {/* Cursors & Interactions */}
            <g className="main-cursor">
                <path d="M0 0L3 3L1.5 3.5L0 5L0 0Z" fill="currentColor" className="cursor-icon" />
                <circle cx="0.5" cy="0.5" r="3" className="cursor-click" />
            </g>
        </g>

        {/* Stand */}
        <path d="M18 40H30" className="monitor-stand-base" />
        <path d="M24 34V40" className="monitor-stand-neck" />
        <path d="M6 31.5H42" className="monitor-bottom-edge" />

        <style>{`
      .dream-interface-svg { overflow: visible; }
      .monitor-frame { stroke: currentColor; fill: rgba(0,0,0,0.4); }
      .ui-window { fill: rgba(255,255,255,0.05); stroke: rgba(255,255,255,0.3); stroke-width: 1; }
      .ui-line, .ui-line-full { stroke: currentColor; stroke-width: 0.8; }
      .ui-accent { fill: currentColor; opacity: 0.6; }
      .ui-button, .ui-button-small { fill: rgba(255,255,255,0.1); stroke: rgba(255,255,255,0.4); stroke-width: 0.5; }
      
      .window-1-group {
        animation: dreamFloat 4s infinite ease-in-out;
      }
      .window-2-group {
        animation: dreamFloat 4s infinite ease-in-out reverse;
      }
      
      @keyframes dreamFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1.5px); }
      }
      
      .dream-path {
        stroke-dasharray: 40;
        stroke-dashoffset: 40;
        animation: drawPath 4s infinite alternate;
      }
      
      @keyframes drawPath {
        0% { stroke-dashoffset: 40; opacity: 0; }
        50% { stroke-dashoffset: 0; opacity: 0.4; }
        100% { stroke-dashoffset: 0; opacity: 0.6; }
      }
      
      .main-cursor {
        animation: cursorMoveDream 6s infinite ease-in-out;
      }
      
      @keyframes cursorMoveDream {
        0% { transform: translate(12px, 14px); }
        33% { transform: translate(30px, 16px); }
        66% { transform: translate(18px, 25px); }
        100% { transform: translate(12px, 14px); }
      }
      
      .cursor-click {
        fill: currentColor;
        stroke: currentColor;
        opacity: 0;
        transform: scale(0);
        animation: clickRipple 6s infinite;
      }
      
      @keyframes clickRipple {
        0%, 30% { opacity: 0; transform: scale(0); }
        33% { opacity: 0.6; transform: scale(1); }
        36% { opacity: 0; transform: scale(2.5); }
        37%, 63% { opacity: 0; transform: scale(0); }
        66% { opacity: 0.6; transform: scale(1); }
        69% { opacity: 0; transform: scale(2.5); }
        70%, 97% { opacity: 0; transform: scale(0); }
        100% { opacity: 0.6; transform: scale(1); }
      }
      
      .monitor-stand-base, .monitor-stand-neck, .monitor-bottom-edge {
        stroke: currentColor;
        opacity: 0.7;
      }
    `}</style>
    </svg>
)
