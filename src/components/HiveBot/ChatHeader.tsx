// components/HiveBot/ChatHeader.tsx
import SplineRobot from "./SplineRobot";

export default function ChatHeader() {
  return (
    <div className="flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4 shadow-lg md:rounded-t-2xl">
      <div className="flex items-center gap-3 animate-slide-in-left">
        <div className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm overflow-hidden transition-transform duration-300 hover:scale-105">
          <SplineRobot />
        </div>
        <div>
          <div className="font-bold text-lg">Hive Bot</div>
          <div className="text-xs opacity-90">AI Assistant</div>
        </div>
      </div>
      <div className="text-xs opacity-80 hidden sm:block bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm animate-slide-in-right transition-all duration-200 hover:bg-white/20">
        Live Assistance
      </div>
    </div>
  );
}