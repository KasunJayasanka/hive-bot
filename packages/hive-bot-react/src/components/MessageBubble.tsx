import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import type { Message } from '../types'
import { ThinkingDots } from './ThinkingDots'
import { SourcesList } from './SourcesList'

interface MessageBubbleProps {
  message: Message
  isThinking?: boolean
}

export function MessageBubble({ message, isThinking = false }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const showThinking = isThinking && !message.text

  return (
    <div
      className={clsx('hivebot-message', isUser ? 'hivebot-message-user' : 'hivebot-message-bot')}
      style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!isUser && (
        <div
          className="hivebot-avatar hivebot-avatar-bot"
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Bot size={16} color="white" />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          maxWidth: '75%',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        {message.file?.url && (
          <div
            className="hivebot-message-image"
            style={{
              position: 'relative',
              width: '256px',
              aspectRatio: '16/9',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={message.file.url}
              alt="attachment"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {(message.text || showThinking) && (
          <div
            className={clsx('hivebot-bubble', isUser ? 'hivebot-bubble-user' : 'hivebot-bubble-bot')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              ...(isUser
                ? {
                    backgroundColor: 'var(--hivebot-user-bg, #6366f1)',
                    color: 'white',
                    borderBottomRightRadius: '0.25rem',
                  }
                : {
                    backgroundColor: 'var(--hivebot-bot-bg, white)',
                    color: 'var(--hivebot-text, #1f2937)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderBottomLeftRadius: '0.25rem',
                  }),
            }}
          >
            {showThinking ? (
              <div style={{ color: 'var(--hivebot-text-muted, #6b7280)' }}>
                <ThinkingDots />
              </div>
            ) : (
              <>
                <div className="hivebot-message-content" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {isUser ? (
                    message.text
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text || ''}</ReactMarkdown>
                  )}
                </div>
                {message.sources && message.sources.length > 0 && <SourcesList sources={message.sources} />}
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="hivebot-avatar hivebot-avatar-user"
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <User size={16} color="white" />
        </div>
      )}
    </div>
  )
}
