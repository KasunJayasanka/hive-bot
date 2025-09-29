# Hive Chat Bot 🤖💬

A modern, responsive chat widget built with **Next.js 14**, **TailwindCSS v4**, and integrated with **Google Gemini API**.  
Designed for embedding into any web application as an AI assistant with support for messages, emojis, file attachments, and live bot responses.

---

## ✨ Features

- 🎨 Beautiful, responsive chat UI with dark/light mode support
- 📱 Mobile-friendly with keyboard-safe layout (iOS + Android)
- 💬 Real-time message flow with smooth auto-scrolling
- 😀 Emoji picker with responsive popover/sheet
- 📎 File upload & preview (images supported, < 10MB)
- ⚡ "Thinking…" typing indicator with animated dots
- 🔌 Modular components (ChatHeader, ChatMessages, ChatInput, MessageBubble, FilePreview, etc.)
- 🔑 Google Gemini API integration for AI responses
- 🛡️ Axios wrapper with normalized error handling

---

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css              # Tailwind global styles + theme tokens
│   ├── page.tsx                 # Entry page with ChatWidget
│   └── api/hive-bot/            # API route for bot backend
├── components/
│   ├── ChatWidget.tsx           # Floating toggle widget
│   ├── EmojiPopover.tsx         # Emoji picker
│   └── HiveBot/                 # Core chat UI components
│       ├── ChatHeader.tsx
│       ├── ChatInput.tsx
│       ├── ChatMessages.tsx
│       ├── FilePreview.tsx
│       ├── MessageBubble.tsx
│       ├── ThinkingDots.tsx
│       └── types.ts
├── lib/
│   ├── geminiClient.ts          # Gemini API client
│   └── http.ts                  # Axios instance + interceptors
└── services/
    └── hiveBot.ts               # Service to call API
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/hive-chat-bot.git
cd hive-chat-bot
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set environment variables

Create a `.env.local` file in the root:

```env
GOOGLE_API_KEY=your-google-api-key
GEMINI_API_BASE=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-2.5-flash
```

### 4. Run the development server

```bash
npm run dev
```

Visit 👉 [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TailwindCSS v4** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **Google Gemini API** - AI-powered responses
- **Axios** - HTTP client with interceptors

---

## 📌 Usage

- Click the floating **chat button** in the bottom-right corner to open/close the widget
- Type messages, add emojis, or upload an image
- Messages are sent to the **Hive Bot API** (`/api/hive-bot`) which connects to Gemini
- Responses are displayed in real-time with a **thinking indicator**

---

## 📷 Preview

*(Add screenshots or GIFs here once you run the app!)*

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request with improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 Kasun Jayasanka

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini API](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ by Kasun Jayasanka**