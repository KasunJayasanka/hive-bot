import { useHiveBot } from '../context/HiveBotContext'
import { BeeCharacter } from './BeeCharacter'

export function ChatHeader() {
  const { config } = useHiveBot()

  return (
    <div
      className="hivebot-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: config.theme?.headerGradient || 'linear-gradient(to right, #6366f1, #9333ea)',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {config.enable3DCharacter && (
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              overflow: 'hidden',
            }}
          >
            <BeeCharacter />
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{config.botName}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{config.botDescription}</div>
        </div>
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          opacity: 0.8,
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          backdropFilter: 'blur(4px)',
        }}
      >
        Live Assistance
      </div>
    </div>
  )
}
