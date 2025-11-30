# @hive-bot/react

A modern, AI-powered chatbot component library for React and Next.js applications with RAG (Retrieval-Augmented Generation) support.

## Features

- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🐝 **3D Bee Character** - Animated 3D mascot using React Three Fiber
- 📱 **Mobile-First** - Fully responsive with touch-friendly interactions
- 🎯 **TypeScript** - Full type safety and IntelliSense support
- 🎨 **Customizable** - Flexible theming and styling options
- 📦 **Lightweight** - Tree-shakeable with minimal dependencies
- 🔌 **Easy Integration** - Works with Next.js, Vite, CRA, and more
- 🌙 **Dark Mode** - Built-in dark mode support
- 📎 **File Upload** - Support for image attachments
- 😊 **Emoji Picker** - Built-in emoji selector
- 🔗 **Source Citations** - Display sources from RAG responses
- ⚡ **Fast** - Optimized for performance

## Installation

```bash
npm install @hive-bot/react
# or
yarn add @hive-bot/react
# or
pnpm add @hive-bot/react
```

## Quick Start

### Basic Usage

```tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

function App() {
  return (
    <HiveBotProvider apiEndpoint="/api/rag/ask">
      <ChatWidget />
    </HiveBotProvider>
  )
}
```

### Next.js App Router

```tsx
// app/layout.tsx or app/page.tsx
'use client'

import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <HiveBotProvider apiEndpoint="/api/rag/ask">
          <ChatWidget position="bottom-right" />
        </HiveBotProvider>
      </body>
    </html>
  )
}
```

### Vite/CRA

```tsx
// main.tsx or App.tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

function App() {
  return (
    <div>
      <h1>My App</h1>
      <HiveBotProvider apiEndpoint="https://api.example.com/chat">
        <ChatWidget />
      </HiveBotProvider>
    </div>
  )
}
```

## API Reference

### HiveBotProvider

The provider component that wraps your application and configures the chatbot.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | **required** | API endpoint for sending messages |
| `apiKey` | `string` | - | Optional API key for authorization |
| `headers` | `Record<string, string>` | - | Additional headers for API requests |
| `theme` | `HiveBotTheme` | - | Custom theme configuration |
| `greeting` | `string` | `"Hello! How can I help you today?"` | Initial bot greeting |
| `placeholder` | `string` | `"Type your message..."` | Input placeholder text |
| `enableEmoji` | `boolean` | `true` | Enable emoji picker |
| `enableFileUpload` | `boolean` | `true` | Enable file upload |
| `maxFileSize` | `number` | `10485760` (10MB) | Maximum file size in bytes |
| `acceptedFileTypes` | `string[]` | `['image/*']` | Accepted file MIME types |
| `showSources` | `boolean` | `true` | Show source citations |
| `enable3DCharacter` | `boolean` | `true` | Show 3D bee character |
| `botName` | `string` | `"Hive Bot"` | Bot display name |
| `botDescription` | `string` | `"AI Assistant"` | Bot description |
| `onMessage` | `(message: Message) => void` | - | Callback when user sends message |
| `onBotResponse` | `(message: Message) => void` | - | Callback when bot responds |
| `onError` | `(error: Error) => void` | - | Error handler |

### ChatWidget

A floating chat widget with toggle button.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Widget position |
| `zIndex` | `number` | `1000` | Z-index for the widget |
| `className` | `string` | - | Custom CSS class |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `isOpen` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(isOpen: boolean) => void` | - | Callback when open state changes |

### HiveBot

The main chat component for inline embedding.

```tsx
import { HiveBotProvider, HiveBot } from '@hive-bot/react'

function ChatPage() {
  return (
    <HiveBotProvider apiEndpoint="/api/chat">
      <div style={{ height: '600px' }}>
        <HiveBot />
      </div>
    </HiveBotProvider>
  )
}
```

## Customization

### Custom Theme

```tsx
<HiveBotProvider
  apiEndpoint="/api/chat"
  theme={{
    primaryColor: '#6366f1',
    backgroundColor: '#f9fafb',
    textColor: '#1f2937',
    borderRadius: '1rem',
    fontFamily: 'Inter, sans-serif',
    userMessageBg: '#6366f1',
    botMessageBg: 'white',
    headerGradient: 'linear-gradient(to right, #6366f1, #9333ea)',
  }}
>
  <ChatWidget />
</HiveBotProvider>
```

### Custom CSS Variables

```css
:root {
  --hivebot-primary: #6366f1;
  --hivebot-bg: #f9fafb;
  --hivebot-text: #1f2937;
  --hivebot-text-muted: #6b7280;
  --hivebot-user-bg: #6366f1;
  --hivebot-bot-bg: white;
  --hivebot-border: rgba(0, 0, 0, 0.1);
}
```

### Event Callbacks

```tsx
<HiveBotProvider
  apiEndpoint="/api/chat"
  onMessage={(message) => {
    console.log('User sent:', message)
    // Track analytics, log, etc.
  }}
  onBotResponse={(message) => {
    console.log('Bot replied:', message)
    // Track response time, etc.
  }}
  onError={(error) => {
    console.error('Chat error:', error)
    // Send to error tracking service
  }}
>
  <ChatWidget />
</HiveBotProvider>
```

### Custom Components

```tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'

function CustomHeader() {
  return (
    <div style={{ padding: '1rem', background: '#000' }}>
      <h2>My Custom Bot</h2>
    </div>
  )
}

function CustomInput({ onSend, disabled }) {
  const [input, setInput] = useState('')

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />
      <button onClick={() => onSend(input)}>Send</button>
    </div>
  )
}

<HiveBotProvider
  apiEndpoint="/api/chat"
  customHeader={CustomHeader}
  customInput={CustomInput}
>
  <ChatWidget />
</HiveBotProvider>
```

## API Response Format

Your API endpoint should return responses in this format:

```typescript
{
  "text": "The bot's response text",
  "sources": [
    {
      "url": "https://example.com/page1",
      "title": "Source Title",
      "similarity": 0.95
    }
  ]
}
```

### Example API Route (Next.js)

```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const message = formData.get('message') as string
  const file = formData.get('file') as File | null

  // Your AI logic here
  const response = await yourAIService.chat(message, file)

  return Response.json({
    text: response.text,
    sources: response.sources,
  })
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  Message,
  Source,
  HiveBotConfig,
  HiveBotTheme,
  ChatWidgetProps,
  ApiResponse,
} from '@hive-bot/react'
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please visit [GitHub Issues](https://github.com/KasunJayasanka/hive-bot/issues).
