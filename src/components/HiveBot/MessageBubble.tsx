// components/HiveBot/MessageBubble.tsx
import Image from "next/image";
import clsx from "clsx";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatItem } from "./types";
import ThinkingDots from "./ThinkingDots";
import { SourcesList } from "./SourcesList";

interface MessageBubbleProps {
  item: ChatItem;
  onContentLoad?: () => void;
}

export default function MessageBubble({ item, onContentLoad }: MessageBubbleProps) {
  const isUser = item.role === "user";
  const isThinking = !item.text && item.role === "bot";

  return (
    <div className={clsx(
      "flex gap-3 group",
      isUser ? "justify-end animate-slide-in-right" : "justify-start animate-slide-in-left"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div className={clsx("flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]", isUser && "items-end")}>
        {item.fileDataUrl && (
          <div className="relative w-48 sm:w-64 aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
            <Image
              src={item.fileDataUrl}
              alt="attachment"
              fill
              className="object-cover"
              unoptimized
              onLoad={onContentLoad}
            />
          </div>
        )}

        {(item.text || isThinking) && (
          <div
            className={clsx(
              "px-4 py-3 rounded-2xl shadow-sm max-w-full",
              "whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
              "transition-all duration-200",
              isUser
                ? "bg-indigo-600 text-white rounded-br-md"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md"
            )}
          >
            {isThinking ? (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <ThinkingDots />
              </div>
            ) : (
              <>
                <div className="text-sm sm:text-base leading-relaxed markdown-content">
                  {isUser ? (
                    item.text
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.text || ""}
                    </ReactMarkdown>
                  )}
                </div>
                {item.sources && item.sources.length > 0 && <SourcesList sources={item.sources} />}
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-300 flex items-center justify-center shadow-sm">
          <User size={16} className="text-white dark:text-gray-700" />
        </div>
      )}
    </div>
  );
}