// components/HiveBot/ChatHeader.tsx
import { Bot } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4 shadow-lg md:rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-lg">Hive Bot</div>
          <div className="text-xs opacity-90">AI Assistant</div>
        </div>
      </div>
      <div className="text-xs opacity-80 hidden sm:block bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
        Live Assistance
      </div>
    </div>
  );
}