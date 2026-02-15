import type { DragEventHandler, MouseEventHandler } from 'react'
import { useTheme } from '../hooks/useTheme'
import '../styles/LogoWithHat.css'

interface LogoWithHatProps {
  src?: string
  alt: string
  size: number
  className?: string
  draggable?: boolean
  onContextMenu?: MouseEventHandler
  onDragStart?: DragEventHandler
  useSvgLogo?: boolean
}

export default function LogoWithHat({
  src,
  alt,
  size,
  className,
  draggable = false,
  onContextMenu,
  onDragStart,
  useSvgLogo = true
}: LogoWithHatProps) {
  const theme = useTheme()
  
  // Выбираем логотип в зависимости от темы: светлая тема = icon1.png, тёмная = icon.png
  const logoSrc = src || (theme === 'light' ? '/icon1.png' : '/icon.png')
  
  const logoClassName = ['logoWithHat__logo', className].filter(Boolean).join(' ')

  if (useSvgLogo) {
    return (
      <span className="logoWithHat">
        <div
          className={logoClassName}
          style={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            src={logoSrc} 
            alt={alt || "Boolean"} 
            width={size} 
            height={size} 
            style={{ imageRendering: 'pixelated' }}
            draggable={draggable}
            onContextMenu={onContextMenu}
            onDragStart={onDragStart}
          />
        </div>
      </span>
    )
  }

  return (
    <span className="logoWithHat">
      <img
        src={logoSrc}
        alt={alt}
        width={size}
        height={size}
        className={logoClassName}
        draggable={draggable}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
      />
    </span>
  )
}
