import React from 'react'
import { motion } from 'framer-motion'
import { IconProps } from './types'

export const IconBolt: React.FC<IconProps> = ({ size = 24, className }) => {
    return (
        <motion.svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="idle"
            whileHover="hover"
        >
            {/* Сама молния */}
            <motion.path
                d="M26 4L14 24H24L22 44L34 24H24L26 4Z"
                fill="currentColor"
                variants={{
                    idle: { y: 0, scale: 1 },
                    hover: {
                        y: [0, -8, 0, -2, 0], // Вверх, удар, отскок, стоп
                        scale: [1, 1.1, 1, 1, 1], // Легкое увеличение при прыжке
                        transition: {
                            duration: 0.5,
                            times: [0, 0.4, 0.6, 0.8, 1]
                        }
                    }
                }}
            />

            {/* Трещины (появляются от кончика молнии x=22, y=44) */}
            <motion.g
                variants={{
                    idle: { opacity: 0, pathLength: 0 },
                    hover: {
                        opacity: [0, 1, 1, 0], // Появиться и исчезнуть
                        pathLength: [0, 1],    // Эффект "рисования" трещины
                        transition: {
                            duration: 0.6,
                            delay: 0.25, // Ждем пока молния ударит (около 0.25s)
                            times: [0, 0.1, 0.8, 1]
                        }
                    }
                }}
            >
                {/* Левая трещина */}
                <path d="M22 44 L16 46 L10 44" strokeWidth="2" fill="none" />
                {/* Правая трещина */}
                <path d="M22 44 L28 46 L34 44" strokeWidth="2" fill="none" />
            </motion.g>
        </motion.svg>
    )
}

export const IconDesktop: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="36" height="26" rx="2" />
        <path d="M6 30H42" />
        <path d="M18 40H30" strokeLinecap="round" />
        <path d="M24 34V40" />
    </svg>
)

export const IconSliders: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="10" width="28" height="4" rx="1" fill="currentColor" />
        <rect x="10" y="18" width="28" height="4" rx="1" fill="currentColor" />
        <rect x="10" y="26" width="28" height="4" rx="1" fill="currentColor" />
        <rect x="10" y="34" width="20" height="4" rx="1" fill="currentColor" />
    </svg>
)

export const IconRefresh: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg className={`${className} animate-spin`} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 24a16 16 0 0 1-28.8 9.6" />
        <path d="M8 24A16 16 0 0 1 36.8 14.4" />
        <path d="M36 8v8h-8" />
        <path d="M12 40v-8h8" />
    </svg>
)
