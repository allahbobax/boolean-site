import React from 'react'
import { IconProps } from './types'

export const IconChecklist: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg
        className={`checklist-icon ${className || ''}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="8" y="6" width="32" height="36" rx="2" className="paper-rect" />

        <g className="lines-group">
            <path d="M16 14H32" className="checklist-line line-1" />
            <path d="M16 22H32" className="checklist-line line-2" />
            <path d="M16 30H26" className="checklist-line line-3" />
        </g>

        <g className="pencil-group">
            <path d="M12 2L4 10L6 12L14 4Z" className="pencil-body" fill="currentColor" />
            <path d="M4 10L2 13L5 11Z" className="pencil-tip" fill="currentColor" />
        </g>

        <g className="check-group">
            <circle cx="36" cy="38" r="8" className="check-circle" fill="currentColor" stroke="none" />
            <path d="M32 38L35 41L40 35" className="check-mark" stroke="white" strokeWidth="2" fill="none" />
        </g>

        <style>{`
      .checklist-icon { overflow: visible; }
      
      .paper-rect {
        stroke: currentColor;
        stroke-opacity: 0.8;
      }

      .checklist-line {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        animation: fillLine 4s infinite ease-in-out;
      }
      
      .line-1 { animation-delay: 0.5s; }
      .line-2 { animation-delay: 1.5s; }
      .line-3 { animation-delay: 2.5s; }

      @keyframes fillLine {
        0%, 10% { stroke-dashoffset: 20; }
        20%, 80% { stroke-dashoffset: 0; }
        90%, 100% { stroke-dashoffset: 20; }
      }

      .pencil-group {
        animation: pencilMove 4s infinite ease-in-out;
        transform-origin: 2px 13px;
        opacity: 0;
      }

      .pencil-body { stroke: none; opacity: 0.8; }
      .pencil-tip { stroke: none; }

      @keyframes pencilMove {
        0% { transform: translate(14px, 1px); opacity: 0; }
        5% { opacity: 1; }
        /* Line 1 */
        10% { transform: translate(14px, 1px); }
        15% { transform: translate(30px, 1px); }
        /* Move to Line 2 */
        20% { transform: translate(14px, 9px); }
        25% { transform: translate(30px, 9px); }
        /* Move to Line 3 */
        30% { transform: translate(14px, 17px); }
        35% { transform: translate(24px, 17px); }
        /* Move to Checkmark area */
        45% { transform: translate(30px, 25px); }
        50% { transform: translate(34px, 28px); }
        55% { transform: translate(32px, 26px); }
        60% { opacity: 1; }
        70%, 100% { transform: translate(40px, 35px); opacity: 0; }
      }

      .check-circle {
        transform: scale(0);
        transform-origin: 36px 38px;
        animation: checkPop 4s infinite ease-in-out;
      }

      @keyframes checkPop {
        0%, 55% { transform: scale(0); }
        60% { transform: scale(1.1); }
        65%, 85% { transform: scale(1); }
        90%, 100% { transform: scale(0); }
      }

      .check-mark {
        stroke-dasharray: 12;
        stroke-dashoffset: 12;
        animation: markDraw 4s infinite ease-in-out;
      }

      @keyframes markDraw {
        0%, 65% { stroke-dashoffset: 12; }
        70%, 85% { stroke-dashoffset: 0; }
        90%, 100% { stroke-dashoffset: 12; }
      }
    `}</style>
    </svg>
)
