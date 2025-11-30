import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { HiveBotConfig, Message, ApiResponse } from '../types'

interface HiveBotContextValue {
  config: Required<HiveBotConfig>
  messages: Message[]
  isLoading: boolean
  sendMessage: (text: string, file?: File) => Promise<void>
  clearMessages: () => void
}

const defaultConfig: Required<HiveBotConfig> = {
  apiEndpoint: '/api/rag/ask',
  apiKey: '',
  headers: {},
  theme: {},
  greeting: 'Hello! How can I help you today?',
  placeholder: 'Type your message...',
  enableEmoji: true,
  enableFileUpload: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: ['image/*'],
  showSources: true,
  enable3DCharacter: true,
  botName: 'Hive Bot',
  botDescription: 'AI Assistant',
  onMessage: () => {},
  onBotResponse: () => {},
  onError: (error) => console.error('HiveBot Error:', error),
  customMessageRenderer: undefined as any,
  customHeader: undefined as any,
  customInput: undefined as any,
}

const HiveBotContext = createContext<HiveBotContextValue | null>(null)

export const useHiveBot = () => {
  const context = useContext(HiveBotContext)
  if (!context) {
    throw new Error('useHiveBot must be used within HiveBotProvider')
  }
  return context
}

interface HiveBotProviderProps {
  children: ReactNode
  config?: Partial<HiveBotConfig>
  apiEndpoint: string
  apiKey?: string
  headers?: Record<string, string>
  theme?: HiveBotConfig['theme']
  greeting?: string
  placeholder?: string
  enableEmoji?: boolean
  enableFileUpload?: boolean
  maxFileSize?: number
  acceptedFileTypes?: string[]
  showSources?: boolean
  enable3DCharacter?: boolean
  botName?: string
  botDescription?: string
  onMessage?: HiveBotConfig['onMessage']
  onBotResponse?: HiveBotConfig['onBotResponse']
  onError?: HiveBotConfig['onError']
  customMessageRenderer?: HiveBotConfig['customMessageRenderer']
  customHeader?: HiveBotConfig['customHeader']
  customInput?: HiveBotConfig['customInput']
}

export const HiveBotProvider: React.FC<HiveBotProviderProps> = ({
  children,
  config: configProp,
  apiEndpoint,
  ...props
}) => {
  const config: Required<HiveBotConfig> = {
    ...defaultConfig,
    ...configProp,
    apiEndpoint,
    ...(props.apiKey !== undefined && { apiKey: props.apiKey }),
    ...(props.headers !== undefined && { headers: props.headers }),
    ...(props.theme !== undefined && { theme: props.theme }),
    ...(props.greeting !== undefined && { greeting: props.greeting }),
    ...(props.placeholder !== undefined && { placeholder: props.placeholder }),
    ...(props.enableEmoji !== undefined && { enableEmoji: props.enableEmoji }),
    ...(props.enableFileUpload !== undefined && { enableFileUpload: props.enableFileUpload }),
    ...(props.maxFileSize !== undefined && { maxFileSize: props.maxFileSize }),
    ...(props.acceptedFileTypes !== undefined && { acceptedFileTypes: props.acceptedFileTypes }),
    ...(props.showSources !== undefined && { showSources: props.showSources }),
    ...(props.enable3DCharacter !== undefined && { enable3DCharacter: props.enable3DCharacter }),
    ...(props.botName !== undefined && { botName: props.botName }),
    ...(props.botDescription !== undefined && { botDescription: props.botDescription }),
    ...(props.onMessage !== undefined && { onMessage: props.onMessage }),
    ...(props.onBotResponse !== undefined && { onBotResponse: props.onBotResponse }),
    ...(props.onError !== undefined && { onError: props.onError }),
    ...(props.customMessageRenderer !== undefined && { customMessageRenderer: props.customMessageRenderer }),
    ...(props.customHeader !== undefined && { customHeader: props.customHeader }),
    ...(props.customInput !== undefined && { customInput: props.customInput }),
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: config.greeting,
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const sendMessage = useCallback(
    async (text: string, file?: File) => {
      const userMessage: Message = {
        id: generateId(),
        text,
        sender: 'user',
        timestamp: new Date(),
        ...(file && {
          file: {
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
          },
        }),
      }

      setMessages((prev) => [...prev, userMessage])
      config.onMessage?.(userMessage)
      setIsLoading(true)

      try {
        const formData = new FormData()
        formData.append('message', text)
        if (file) {
          formData.append('file', file)
        }

        const headers: HeadersInit = {
          ...config.headers,
        }

        if (config.apiKey) {
          headers['Authorization'] = `Bearer ${config.apiKey}`
        }

        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers,
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data: ApiResponse = await response.json()

        const botMessage: Message = {
          id: generateId(),
          text: data.text,
          sender: 'bot',
          timestamp: new Date(),
          sources: data.sources,
        }

        setMessages((prev) => [...prev, botMessage])
        config.onBotResponse?.(botMessage)
      } catch (error) {
        const errorMessage: Message = {
          id: generateId(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        config.onError?.(error as Error)
      } finally {
        setIsLoading(false)
      }
    },
    [config]
  )

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: config.greeting,
        sender: 'bot',
        timestamp: new Date(),
      },
    ])
  }, [config.greeting])

  return (
    <HiveBotContext.Provider
      value={{
        config,
        messages,
        isLoading,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </HiveBotContext.Provider>
  )
}
