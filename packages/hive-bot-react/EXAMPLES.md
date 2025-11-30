# Usage Examples

## Table of Contents

- [Basic Floating Widget](#basic-floating-widget)
- [Inline Chat Component](#inline-chat-component)
- [Next.js Integration](#nextjs-integration)
- [Vite Integration](#vite-integration)
- [Custom Styling](#custom-styling)
- [With Authentication](#with-authentication)
- [Custom Message Handling](#custom-message-handling)
- [File Upload](#file-upload)
- [Controlled Widget State](#controlled-widget-state)

## Basic Floating Widget

The simplest way to add HiveBot to your app:

```tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

function App() {
  return (
    <div>
      <h1>My App</h1>
      <HiveBotProvider apiEndpoint="/api/rag/ask">
        <ChatWidget />
      </HiveBotProvider>
    </div>
  )
}
```

## Inline Chat Component

Embed the chat directly in your page:

```tsx
import { HiveBotProvider, HiveBot } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

function ChatPage() {
  return (
    <HiveBotProvider apiEndpoint="/api/chat">
      <div style={{ height: '600px', width: '100%' }}>
        <HiveBot />
      </div>
    </HiveBotProvider>
  )
}
```

## Next.js Integration

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import { ChatbotWrapper } from './components/ChatbotWrapper'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatbotWrapper />
      </body>
    </html>
  )
}
```

```tsx
// app/components/ChatbotWrapper.tsx
'use client'

import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

export function ChatbotWrapper() {
  return (
    <HiveBotProvider apiEndpoint="/api/rag/ask">
      <ChatWidget position="bottom-right" />
    </HiveBotProvider>
  )
}
```

```tsx
// app/api/rag/ask/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const message = formData.get('message') as string
  const file = formData.get('file') as File | null

  // Your AI logic here
  const response = {
    text: "I'm a helpful assistant!",
    sources: [
      {
        url: 'https://example.com',
        title: 'Example Source',
      },
    ],
  }

  return Response.json(response)
}
```

### Pages Router (Next.js 12)

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <HiveBotProvider apiEndpoint="/api/rag/ask">
        <ChatWidget />
      </HiveBotProvider>
    </>
  )
}
```

## Vite Integration

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <HiveBotProvider apiEndpoint="https://api.example.com/chat">
      <ChatWidget />
    </HiveBotProvider>
  </React.StrictMode>
)
```

## Custom Styling

### Using Theme Props

```tsx
<HiveBotProvider
  apiEndpoint="/api/chat"
  theme={{
    primaryColor: '#10b981',
    backgroundColor: '#ecfdf5',
    textColor: '#064e3b',
    borderRadius: '1.5rem',
    fontFamily: 'Poppins, sans-serif',
    userMessageBg: '#10b981',
    botMessageBg: 'white',
    headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  }}
  botName="Support Bot"
  botDescription="Here to help 24/7"
>
  <ChatWidget />
</HiveBotProvider>
```

### Using CSS Variables

```css
/* styles/chatbot-theme.css */
:root {
  --hivebot-primary: #10b981;
  --hivebot-bg: #ecfdf5;
  --hivebot-text: #064e3b;
  --hivebot-user-bg: #10b981;
  --hivebot-bot-bg: white;
}

.dark {
  --hivebot-primary: #34d399;
  --hivebot-bg: #064e3b;
  --hivebot-text: #ecfdf5;
  --hivebot-bot-bg: #065f46;
}
```

## With Authentication

```tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import { useAuth } from './hooks/useAuth'

function AuthenticatedChat() {
  const { user, token } = useAuth()

  if (!user) {
    return <div>Please log in to chat</div>
  }

  return (
    <HiveBotProvider
      apiEndpoint="/api/chat"
      apiKey={token}
      headers={{
        'X-User-ID': user.id,
      }}
    >
      <ChatWidget />
    </HiveBotProvider>
  )
}
```

## Custom Message Handling

```tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import { analytics } from './lib/analytics'

function AnalyticsChat() {
  return (
    <HiveBotProvider
      apiEndpoint="/api/chat"
      onMessage={(message) => {
        analytics.track('chat_message_sent', {
          length: message.text.length,
          hasFile: !!message.file,
        })
      }}
      onBotResponse={(message) => {
        analytics.track('chat_response_received', {
          length: message.text.length,
          sourcesCount: message.sources?.length || 0,
        })
      }}
      onError={(error) => {
        analytics.track('chat_error', {
          message: error.message,
        })
        console.error('Chat error:', error)
      }}
    >
      <ChatWidget />
    </HiveBotProvider>
  )
}
```

## File Upload

```tsx
<HiveBotProvider
  apiEndpoint="/api/chat"
  enableFileUpload={true}
  maxFileSize={5 * 1024 * 1024} // 5MB
  acceptedFileTypes={['image/*', 'application/pdf']}
>
  <ChatWidget />
</HiveBotProvider>
```

API Handler:

```typescript
// Handle file uploads in your API
export async function POST(request: Request) {
  const formData = await request.formData()
  const message = formData.get('message') as string
  const file = formData.get('file') as File | null

  if (file) {
    // Process the file
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Send to vision API, OCR, etc.
    const imageAnalysis = await analyzeImage(base64)

    return Response.json({
      text: `I can see ${imageAnalysis.description}. ${yourAIResponse}`,
      sources: [],
    })
  }

  // Regular text message
  return Response.json({
    text: yourAIResponse,
    sources: [],
  })
}
```

## Controlled Widget State

```tsx
import { useState } from 'react'
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'

function ControlledChat() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Support Chat</button>

      <HiveBotProvider apiEndpoint="/api/chat">
        <ChatWidget isOpen={isOpen} onOpenChange={setIsOpen} />
      </HiveBotProvider>
    </div>
  )
}
```

## Disable Features

```tsx
<HiveBotProvider
  apiEndpoint="/api/chat"
  enableEmoji={false}
  enableFileUpload={false}
  enable3DCharacter={false}
  showSources={false}
>
  <ChatWidget />
</HiveBotProvider>
```

## Multiple Chat Instances

```tsx
function MultiChat() {
  return (
    <div>
      <HiveBotProvider apiEndpoint="/api/support" botName="Support">
        <div style={{ height: '400px' }}>
          <HiveBot />
        </div>
      </HiveBotProvider>

      <HiveBotProvider apiEndpoint="/api/sales" botName="Sales">
        <div style={{ height: '400px' }}>
          <HiveBot />
        </div>
      </HiveBotProvider>
    </div>
  )
}
```

## With React Router

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <HiveBotProvider apiEndpoint="/api/chat">
        <ChatWidget />
      </HiveBotProvider>
    </BrowserRouter>
  )
}
```
