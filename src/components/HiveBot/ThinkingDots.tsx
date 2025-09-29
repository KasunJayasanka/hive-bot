// components/HiveBot/ThinkingDots.tsx
export default function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"
          style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.4s" }}
        />
      ))}
      <span className="ml-2 text-sm">Thinking...</span>
    </div>
  );
}