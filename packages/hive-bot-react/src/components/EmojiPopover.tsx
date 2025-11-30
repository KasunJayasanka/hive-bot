'use client'

import { useEffect, useRef } from 'react'

interface EmojiPopoverProps {
  onSelect: (emoji: string) => void
  className?: string
}

export function EmojiPopover({ onSelect, className = '' }: EmojiPopoverProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    import('emoji-picker-element')
  }, [])

  useEffect(() => {
    const picker = ref.current
    if (!picker) return

    picker.style.display = 'block'
    picker.style.width = '100%'

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ unicode?: string }>
      onSelect(custom?.detail?.unicode ?? '')
    }
    picker.addEventListener('emoji-click', handler)
    return () => picker.removeEventListener('emoji-click', handler)
  }, [onSelect])

  return (
    <div className={`hivebot-emoji-popover ${className}`}>
      {/* @ts-expect-error: custom web component */}
      <emoji-picker ref={ref} class="responsive-emoji-picker"></emoji-picker>
    </div>
  )
}
