import { ExternalLink } from 'lucide-react'
import type { Source } from '../types'

interface SourcesListProps {
  sources: Source[]
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  const getDomainName = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const truncateUrl = (url: string, maxLength = 50): string => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength - 3) + '...'
  }

  return (
    <div
      className="hivebot-sources"
      style={{
        marginTop: '0.75rem',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        paddingTop: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <ExternalLink size={16} style={{ color: 'var(--hivebot-primary, #6366f1)' }} />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.8,
          }}
        >
          Sources
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hivebot-source-link"
            style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--hivebot-primary, #6366f1)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
                marginTop: '2px',
              }}
            >
              {idx + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--hivebot-primary, #6366f1)',
                  wordBreak: 'break-all',
                }}
              >
                {source.title || getDomainName(source.url)}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={source.url}
              >
                {truncateUrl(source.url)}
              </div>
            </div>
            <ExternalLink size={14} style={{ flexShrink: 0, marginTop: '4px', opacity: 0.4 }} />
          </a>
        ))}
      </div>
    </div>
  )
}
