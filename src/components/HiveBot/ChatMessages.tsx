// components/HiveBot/ChatMessages.tsx
import { forwardRef } from "react";
import clsx from "clsx";
import { ChatItem } from "./types";
import MessageBubble from "./MessageBubble";

interface ChatMessagesProps {
  messages: ChatItem[];
  onContentLoad: () => void;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, onContentLoad }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "px-3 sm:px-4 py-4 flex flex-col gap-4",
          "bg-gray-50 dark:bg-gray-800"
        )}
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} item={m} onContentLoad={onContentLoad} />
        ))}
      </div>
    );
  }
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;