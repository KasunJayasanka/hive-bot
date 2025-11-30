'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Paperclip, Send, Smile, X } from 'lucide-react'
import clsx from 'clsx'
import { useHiveBot } from '../context/HiveBotContext'
import { EmojiPopover } from './EmojiPopover'

export function ChatInput() {
  const { config, isLoading, sendMessage } = useHiveBot()
  const [input, setInput] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const [emojiPos, setEmojiPos] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    if (!emojiOpen || !emojiBtnRef.current) return
    const r = emojiBtnRef.current.getBoundingClientRect()
    const GAP = 12
    const PICKER_W = 360
    const PICKER_H = 420
    const left = Math.max(8, Math.min(r.right - PICKER_W, window.innerWidth - 8 - PICKER_W))
    const top = Math.max(8, r.top - GAP - PICKER_H)
    setEmojiPos({ left, top })
  }, [emojiOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > config.maxFileSize) {
      alert(`File size must be less than ${Math.round(config.maxFileSize / 1024 / 1024)}MB`)
      return
    }

    setPendingFile(file)
    setFilePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview)
    setPendingFile(null)
    setFilePreview(null)
  }

  const handleSend = async () => {
    if (!input.trim() && !pendingFile) return
    if (isLoading) return

    const message = input.trim()
    const file = pendingFile

    setInput('')
    removeFile()

    await sendMessage(message, file || undefined)
  }

  const insertEmojiAtCaret = (emoji: string) => {
    const el = textareaRef.current
    if (!el) {
      setInput(input + emoji)
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const next = input.slice(0, start) + emoji + input.slice(end)
    setInput(next)
    requestAnimationFrame(() => {
      el.focus()
      const caret = start + emoji.length
      el.setSelectionRange(caret, caret)
    })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = (input.trim() || pendingFile) && !isLoading

  if (config.customInput) {
    const CustomInput = config.customInput
    return <CustomInput onSend={sendMessage} disabled={isLoading} />
  }

  return (
    <div
      className="hivebot-input-container"
      style={{
        borderTop: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        padding: '1rem',
      }}
    >
      {/* File preview */}
      {pendingFile && filePreview && (
        <div
          style={{
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <img src={filePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 500 }}>Image attached</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ready to send</div>
          </div>
          <button
            onClick={removeFile}
            style={{
              padding: '0.25rem',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#f9fafb',
          borderRadius: '1rem',
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', padding: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              ref={textareaRef}
              className="hivebot-textarea"
              placeholder={config.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              style={{
                width: '100%',
                resize: 'none',
                outline: 'none',
                background: 'transparent',
                border: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
                minHeight: '24px',
                maxHeight: '120px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            {config.enableEmoji && (
              <div style={{ position: 'relative' }}>
                <button
                  ref={emojiBtnRef}
                  type="button"
                  onClick={() => setEmojiOpen((v) => !v)}
                  className={clsx('hivebot-btn hivebot-btn-icon', emojiOpen && 'active')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: emojiOpen ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: emojiOpen ? '#6366f1' : '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Add emoji"
                >
                  <Smile size={18} />
                </button>

                {emojiOpen && emojiPos && typeof document !== 'undefined' &&
                  createPortal(
                    <div
                      className="hidden sm:block"
                      style={{ position: 'fixed', zIndex: 50, left: emojiPos.left, top: emojiPos.top }}
                    >
                      <EmojiPopover
                        onSelect={(emoji) => {
                          insertEmojiAtCaret(emoji)
                          setEmojiOpen(false)
                        }}
                      />
                    </div>,
                    document.body
                  )}

                {emojiOpen && (
                  <div
                    className="sm:hidden"
                    style={{
                      position: 'fixed',
                      left: '1rem',
                      right: '1rem',
                      bottom: '8rem',
                      zIndex: 50,
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      maxHeight: '65vh',
                    }}
                  >
                    <EmojiPopover
                      onSelect={(emoji) => {
                        insertEmojiAtCaret(emoji)
                        setEmojiOpen(false)
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {config.enableFileUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hivebot-btn hivebot-btn-icon"
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: pendingFile ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: pendingFile ? '#6366f1' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
            )}

            <button
              onClick={handleSend}
              disabled={!canSend}
              className="hivebot-btn hivebot-btn-send"
              style={{
                padding: '0.5rem',
                borderRadius: '50%',
                border: 'none',
                background: canSend ? 'var(--hivebot-primary, #6366f1)' : '#d1d5db',
                color: 'white',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: canSend ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
              }}
              title="Send message"
            >
              {isLoading ? (
                <div style={{ animation: 'spin 1s linear infinite' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '0 0.75rem 0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
          <span className="sm:hidden">Tap send button or use Enter to send</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={config.acceptedFileTypes.join(',')}
        hidden
        onChange={handleFileChange}
      />
    </div>
  )
}
