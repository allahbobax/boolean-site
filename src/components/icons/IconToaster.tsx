import React from 'react'
import { IconProps } from './types'

export const IconToaster: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg
        className={`toaster-icon ${className || ''}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <defs>
            <linearGradient id="toasterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
        </defs>

        {/* Bread Slices */}
        <g className="bread-slices">
            <path d="M15 14C15 12.5 16 11.5 17.5 11.5H30.5C32 11.5 33 12.5 33 14V18H15V14Z" fill="currentColor" fillOpacity="0.2" className="slice-1" />
            <path d="M17 12C17 10.5 18 9.5 19.5 9.5H28.5C30 9.5 31 10.5 31 12V18H17V12Z" fill="currentColor" fillOpacity="0.3" className="slice-2" />
        </g>

        {/* Toaster Body */}
        <path d="M8 20C8 17.8 9.8 16 12 16H36C38.2 16 40 17.8 40 20V38H8V20Z" fill="url(#toasterGradient)" className="toaster-main" />

        {/* Lever */}
        <g className="lever-node">
            <rect x="40" y="24" width="5" height="2" rx="1" fill="currentColor" />
        </g>

        {/* Slot/Details */}
        <path d="M12 16H36" />
        <path d="M12 32H36" opacity="0.2" />

        <style>{`
      .toaster-icon { overflow: visible; }
      
      .lever-node {
        animation: toasterLeverMove 3s infinite ease-in-out;
      }
      
      @keyframes toasterLeverMove {
        0%, 20% { transform: translateY(0); }
        30%, 70% { transform: translateY(10px); }
        80%, 100% { transform: translateY(0); }
      }
      
      .bread-slices {
        animation: toasterBreadPop 3s infinite ease-in-out;
      }
      
      @keyframes toasterBreadPop {
        0%, 20% { transform: translateY(0); opacity: 1; }
        30%, 70% { transform: translateY(8px); opacity: 0.5; }
        80% { transform: translateY(-12px); opacity: 1; }
        90%, 100% { transform: translateY(0); opacity: 1; }
      }
    `}</style>
    </svg>
)
