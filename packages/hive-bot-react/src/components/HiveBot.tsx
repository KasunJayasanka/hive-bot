import { useEffect, useRef } from 'react'
import { useHiveBot } from '../context/HiveBotContext'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

export function HiveBot({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const { messages, isLoading, config } = useHiveBot()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className={`hivebot ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        backgroundColor: 'white',
        borderRadius: config.theme?.borderRadius || '1rem',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        fontFamily: config.theme?.fontFamily || 'system-ui, -apple-system, sans-serif',
        ...style,
      }}
    >
      {config.customHeader ? <config.customHeader /> : <ChatHeader />}
      <ChatMessages messages={messages} isLoading={isLoading} ref={messagesEndRef} />
      <ChatInput />
    </div>
  )
}
