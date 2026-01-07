import React from 'react'

interface MoonIconProps {
  size?: number
  className?: string
}

export const MoonIcon: React.FC<MoonIconProps> = ({ size = 20, className }) => (
  <svg 
    className={className || ''} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
