// Main exports
export { HiveBotProvider, useHiveBot } from './context/HiveBotContext'
export { HiveBot } from './components/HiveBot'
export { ChatWidget } from './components/ChatWidget'

// Component exports
export { ChatHeader } from './components/ChatHeader'
export { ChatInput } from './components/ChatInput'
export { ChatMessages } from './components/ChatMessages'
export { MessageBubble } from './components/MessageBubble'
export { BeeCharacter } from './components/BeeCharacter'
export { SourcesList } from './components/SourcesList'
export { ThinkingDots } from './components/ThinkingDots'
export { EmojiPopover } from './components/EmojiPopover'

// Type exports
export type {
  Message,
  Source,
  HiveBotConfig,
  HiveBotTheme,
  ChatWidgetProps,
  ApiResponse,
  SendMessageOptions,
} from './types'
