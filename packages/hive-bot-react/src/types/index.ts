export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  file?: {
    url: string
    type: string
    name: string
  }
  sources?: Source[]
}

export interface Source {
  url: string
  title: string
  similarity?: number
}

export interface HiveBotTheme {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
  fontFamily?: string
  userMessageBg?: string
  botMessageBg?: string
  headerGradient?: string
}

export interface HiveBotConfig {
  /** API endpoint for sending messages (required) */
  apiEndpoint: string

  /** Optional API key or authorization header */
  apiKey?: string

  /** Additional headers to send with requests */
  headers?: Record<string, string>

  /** Custom theme configuration */
  theme?: HiveBotTheme

  /** Initial greeting message */
  greeting?: string

  /** Placeholder text for input */
  placeholder?: string

  /** Enable emoji picker (default: true) */
  enableEmoji?: boolean

  /** Enable file upload (default: true) */
  enableFileUpload?: boolean

  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number

  /** Accepted file types (default: ['image/*']) */
  acceptedFileTypes?: string[]

  /** Show sources/citations (default: true) */
  showSources?: boolean

  /** Enable 3D bee character (default: true) */
  enable3DCharacter?: boolean

  /** Custom bot name (default: 'Hive Bot') */
  botName?: string

  /** Custom bot description */
  botDescription?: string

  /** Callback fired when user sends a message */
  onMessage?: (message: Message) => void

  /** Callback fired when bot responds */
  onBotResponse?: (message: Message) => void

  /** Callback fired on errors */
  onError?: (error: Error) => void

  /** Custom message renderer component */
  customMessageRenderer?: React.ComponentType<{ message: Message }>

  /** Custom header component */
  customHeader?: React.ComponentType

  /** Custom input component */
  customInput?: React.ComponentType<{
    onSend: (text: string, file?: File) => void
    disabled?: boolean
  }>
}

export interface ChatWidgetProps {
  /** Position of the chat widget (default: 'bottom-right') */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

  /** Z-index for the widget (default: 1000) */
  zIndex?: number

  /** Custom class name for styling */
  className?: string

  /** Initial open state (default: false) */
  defaultOpen?: boolean

  /** Controlled open state */
  isOpen?: boolean

  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void
}

export interface ApiResponse {
  text: string
  sources?: Source[]
  error?: string
}

export interface SendMessageOptions {
  message: string
  file?: File
}
