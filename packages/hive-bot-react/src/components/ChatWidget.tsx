'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import type { ChatWidgetProps } from '../types'
import { HiveBot } from './HiveBot'

export function ChatWidget({
  position = 'bottom-right',
  zIndex = 1000,
  className = '',
  defaultOpen = false,
  isOpen: controlledOpen,
  onOpenChange,
}: ChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const toggleOpen = () => {
    const newValue = !isOpen
    if (!isControlled) {
      setInternalOpen(newValue)
    }
    onOpenChange?.(newValue)
  }

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '1.5rem', right: '1.5rem' },
    'bottom-left': { bottom: '1.5rem', left: '1.5rem' },
    'top-right': { top: '1.5rem', right: '1.5rem' },
    'top-left': { top: '1.5rem', left: '1.5rem' },
  }

  return (
    <>
      {/* Chat Container */}
      {isOpen && (
        <div
          className={`hivebot-widget ${className}`}
          style={{
            position: 'fixed',
            ...positionStyles[position],
            zIndex,
            width: '400px',
            height: '600px',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'calc(100vh - 2rem)',
          }}
        >
          <HiveBot />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className="hivebot-toggle"
        style={{
          position: 'fixed',
          ...positionStyles[position],
          zIndex: zIndex + 1,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(to bottom right, #6366f1, #9333ea)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.2)'
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}
