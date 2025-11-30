import { forwardRef } from 'react'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isLoading }, ref) => {
    return (
      <div
        ref={ref}
        className="hivebot-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--hivebot-bg, #f9fafb)',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <MessageBubble
            message={{
              id: 'thinking',
              text: '',
              sender: 'bot',
              timestamp: new Date(),
            }}
            isThinking
          />
        )}
      </div>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
