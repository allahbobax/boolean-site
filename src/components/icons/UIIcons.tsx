import React from 'react'
import { IconProps } from './types'

export const IconClose: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 6L6 18M6 6L18 18" />
    </svg>
)

export const IconArrowRight: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg className={`arrow-animated ${className || ''}`} width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ marginTop: '2px' }}>
        <path className="arrow-path" d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <style>{`
            .arrow-animated { overflow: visible; }
            .arrow-path {
                animation: arrowMove 2s infinite ease-in-out;
            }
            @keyframes arrowMove {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(6px); }
            }
        `}</style>
    </svg>
)

export const IconShoppingBag: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
)

export const IconEmpty: React.FC<IconProps> = ({ size = 64, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="16" width="20" height="12" fill="currentColor" opacity="0.3" />
        <rect x="16" y="32" width="32" height="2" fill="currentColor" opacity="0.3" />
        <rect x="16" y="40" width="32" height="2" fill="currentColor" opacity="0.3" />
    </svg>
)

export const IconAuthor: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="5" r="3" />
        <path d="M8 10C4.68629 10 2 11.7909 2 14H14C14 11.7909 11.3137 10 8 10Z" />
    </svg>
)

export const IconTrophy: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="#FFD700" fill-opacity="0.8" />
    </svg>
)

export const IconTarget: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
)

export const IconSend: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 21 12 17 16" />
        <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
)

export const IconQuestion: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)
