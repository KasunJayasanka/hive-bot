# Hive Chat Bot 🤖💬

A modern, intelligent chat widget with **RAG (Retrieval-Augmented Generation)** capabilities, built with **Next.js 14**, **TailwindCSS v4**, and powered by **Google Gemini API** with **Supabase** vector storage.

An AI assistant that can crawl websites, understand images, and answer questions using your own knowledge base with semantic search.

---

## ✨ Features

### Chat Interface
- 🎨 Beautiful, responsive chat UI with dark/light mode support
- 📱 Mobile-optimized with keyboard-safe layout (iOS + Android)
- 💬 Real-time message flow with smooth auto-scrolling
- 😀 Emoji picker with responsive popover/sheet
- 📎 Image upload & preview with OCR support (< 10MB)
- ⚡ "Thinking…" typing indicator with animated dots
- 🔌 Modular, reusable component architecture

### RAG System
- 🕷️ **Website crawler** with concurrent page fetching (up to 200 pages)
- 🧠 **Vector embeddings** using Google's text-embedding-004
- 🔍 **Semantic search** with similarity scoring
- 📚 **Context-aware responses** grounded in your content
- 🖼️ **Vision AI** for image analysis (OCR + captioning)
- 💾 **Supabase pgvector** for efficient similarity search
- 🔄 **Admin dashboard** for content ingestion and management

---

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css              # Tailwind v4 styles + theme tokens
│   ├── page.tsx                 # Main page with ChatWidget
│   ├── admin/
│   │   └── page.tsx            # Admin dashboard for RAG management
│   └── api/
│       ├── hive-bot/           # Legacy bot endpoint
│       └── rag/
│           ├── ask/            # RAG query endpoint
│           └── ingest/         # Crawl & embed endpoint
├── components/
│   ├── ChatWidget.tsx           # Floating toggle widget
│   ├── EmojiPopover.tsx         # Emoji picker component
│   └── HiveBot/                 # Core chat UI
│       ├── ChatHeader.tsx
│       ├── ChatInput.tsx
│       ├── ChatMessages.tsx
│       ├── FilePreview.tsx
│       ├── MessageBubble.tsx
│       ├── ThinkingDots.tsx
│       ├── index.tsx
│       └── types.ts
├── lib/
│   ├── chunk.ts                 # Text chunking utilities
│   ├── crawl.ts                 # Puppeteer-based crawler
│   ├── embeddings.ts            # Gemini embedding client
│   ├── geminiClient.ts          # Gemini API wrapper
│   ├── http.ts                  # Axios instance + interceptors
│   ├── prompt.ts                # RAG prompt engineering
│   ├── supabase.ts              # Supabase admin client
│   └── vision.ts                # Image analysis with Gemini
└── services/
    ├── hiveBot.ts               # Bot service layer
    └── rag.ts                   # RAG service layer
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account with pgvector extension enabled
- Google AI API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hive-chat-bot.git
cd hive-chat-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a table for documents:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding VECTOR(768), -- Gemini text-embedding-004 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

### 4. Configure environment variables

Create `.env.local`:

```env
# Google AI
GOOGLE_API_KEY=your-google-api-key-here
GEMINI_API_BASE=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-2.5-flash
GEMINI_VISION_MODEL=gemini-2.5-flash
GEMINI_EMBED_MODEL=text-embedding-004

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run the development server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 🎯 How It Works

### RAG Pipeline

1. **Ingestion** (`/api/rag/ingest`)
   - Crawls website using Puppeteer (concurrent, configurable depth)
   - Extracts clean text content from HTML
   - Chunks text into 1000-char segments with 150-char overlap
   - Generates embeddings using Gemini text-embedding-004
   - Stores in Supabase with pgvector

2. **Query** (`/api/rag/ask`)
   - Accepts text query + optional image
   - If image: analyzes with Gemini Vision (OCR + caption)
   - Generates query embedding
   - Performs cosine similarity search in Supabase
   - Retrieves top-K relevant chunks (default: 6, min similarity: 0.55)
   - Constructs context-aware prompt
   - Generates response with Gemini
   - Returns answer + source URLs

### Image Support

When you upload an image:
- **OCR**: Extracts all visible text
- **Captioning**: Generates semantic description
- **Entity extraction**: Identifies brands, products, labels
- Combined with text query for multimodal search

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **React 18** - UI framework
- **TailwindCSS v4** - Utility-first styling
- **Lucide Icons** - Icon library
- **emoji-picker-element** - Native emoji picker

### Backend
- **Google Gemini API** - LLM + embeddings + vision
- **Supabase** - PostgreSQL + pgvector
- **Puppeteer** - Web scraping
- **Axios** - HTTP client

### Utilities
- **p-limit** - Concurrency control
- **clsx** - Conditional classes

---

## 📖 Usage

### End User

1. Click the floating chat button (bottom-right)
2. Type a question or upload an image
3. Get AI responses grounded in your website content
4. Sources are cited for transparency

### Admin Dashboard

Visit **http://localhost:3000/admin** to:

- **Ingest new content**: Enter a URL to crawl (up to 200 pages)
- **Regenerate embeddings**: Fix documents missing vectors
- Monitor ingestion progress and results

---

## ⚙️ Configuration

### Crawl Settings

In `/api/rag/ingest`:

```typescript
maxPages: 200,      // Maximum pages to crawl
concurrency: 10,    // Parallel requests
sameHostOnly: true, // Stay on same domain
timeout: 30000      // Request timeout (ms)
```

### RAG Parameters

In `/services/rag.ts`:

```typescript
topK: 6,           // Number of chunks to retrieve
minSim: 0.55       // Minimum similarity threshold (0-1)
```

### Chunk Settings

In `/lib/chunk.ts`:

```typescript
chunkSize: 1000,      // Characters per chunk
chunkOverlap: 150     // Overlap between chunks
```

---

## 🔒 Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep server-side only
- API routes are server-only (not exposed to client)
- File uploads limited to 10MB
- No localStorage/sessionStorage in artifacts (uses React state)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 Kasun Jayasanka

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini API](https://ai.google.dev/) - AI capabilities
- [Supabase](https://supabase.com/) - Vector database
- [Lucide](https://lucide.dev/) - Icon system

---

**Made with ❤️ by Kasun Jayasanka**