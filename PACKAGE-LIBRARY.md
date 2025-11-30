# HiveBot as a Package/Library

The HiveBot chatbot has been converted into a reusable React package that can be easily integrated into any React or Next.js project.

## 📦 Package Location

The package is located in `packages/hive-bot-react/`

## 🚀 Quick Start

### Installation

You have two options to use this package:

#### Option 1: Install from npm (when published)

```bash
npm install @hive-bot/react
```

#### Option 2: Install locally (for development/testing)

```bash
# From your project directory
npm install /path/to/hive-bot/packages/hive-bot-react

# Or using a file: reference in package.json
{
  "dependencies": {
    "@hive-bot/react": "file:../hive-bot/packages/hive-bot-react"
  }
}
```

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

## 📚 Documentation

- **[README.md](./packages/hive-bot-react/README.md)** - Complete API reference and features
- **[EXAMPLES.md](./packages/hive-bot-react/EXAMPLES.md)** - Usage examples for different frameworks

## 🏗️ Package Structure

```
packages/hive-bot-react/
├── src/
│   ├── components/       # React components
│   │   ├── BeeCharacter.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── EmojiPopover.tsx
│   │   ├── HiveBot.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── SourcesList.tsx
│   │   └── ThinkingDots.tsx
│   ├── context/          # React Context
│   │   └── HiveBotContext.tsx
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── styles/           # CSS styles
│   │   └── index.css
│   └── index.ts          # Main entry point
├── dist/                 # Build output (generated)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── EXAMPLES.md
└── LICENSE
```

## 🛠️ Development

### Building the Package

```bash
cd packages/hive-bot-react
npm install
npm run build
```

This will generate:
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ES Module bundle
- `dist/index.d.ts` - TypeScript declarations
- `dist/styles.css` - Compiled styles

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

## 🎨 Key Features

1. **Framework Agnostic**: Works with Next.js, Vite, Create React App, and more
2. **TypeScript Support**: Full type safety with exported types
3. **Customizable**: Extensive theming and configuration options
4. **Responsive**: Mobile-first design with touch support
5. **Accessible**: ARIA labels and keyboard navigation
6. **3D Character**: Optional animated 3D bee mascot
7. **File Upload**: Support for image attachments
8. **Emoji Picker**: Built-in emoji selector
9. **RAG Support**: Display source citations from responses

## 📝 API Requirements

Your API endpoint should accept POST requests with FormData:

**Request:**
```
POST /api/rag/ask
Content-Type: multipart/form-data

{
  message: "User's message",
  file: File (optional)
}
```

**Response:**
```json
{
  "text": "Bot response text",
  "sources": [
    {
      "url": "https://example.com",
      "title": "Source Title",
      "similarity": 0.95
    }
  ]
}
```

## 🔧 Integration Examples

### Next.js 13+ (App Router)

```tsx
// app/components/Chatbot.tsx
'use client'

import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

export function Chatbot() {
  return (
    <HiveBotProvider apiEndpoint="/api/rag/ask">
      <ChatWidget position="bottom-right" />
    </HiveBotProvider>
  )
}

// app/layout.tsx
import { Chatbot } from './components/Chatbot'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Chatbot />
      </body>
    </html>
  )
}
```

### Vite + React

```tsx
// src/main.tsx
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

### Create React App

```tsx
// src/App.tsx
import { HiveBotProvider, ChatWidget } from '@hive-bot/react'
import '@hive-bot/react/styles.css'

function App() {
  return (
    <>
      <div className="app-content">
        {/* Your app content */}
      </div>
      <HiveBotProvider apiEndpoint="/api/chat">
        <ChatWidget />
      </HiveBotProvider>
    </>
  )
}
```

## 🎯 Publishing (Optional)

To publish the package to npm:

1. Update version in `package.json`
2. Build the package: `npm run build`
3. Login to npm: `npm login`
4. Publish: `npm publish --access public`

## 📄 License

MIT - See [LICENSE](./packages/hive-bot-react/LICENSE)

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/KasunJayasanka/hive-bot/issues
- Package README: [packages/hive-bot-react/README.md](./packages/hive-bot-react/README.md)
