// components/HiveBot/ChatInput.tsx
"use client";

import { useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Paperclip, Send, Smile } from "lucide-react";
import EmojiPopover from "@/components/EmojiPopover";
import { PendingFile } from "./types";
import FilePreview from "./FilePreview";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileSelect: (file: File) => void;
  pendingFile: PendingFile | null;
  onRemoveFile: () => void;
  canSend: boolean;
  sending: boolean;
  onContentLoad: () => void;
}

export default function ChatInput({
  input,
  onInputChange,
  onSend,
  onFileSelect,
  pendingFile,
  onRemoveFile,
  canSend,
  sending,
  onContentLoad,
}: ChatInputProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const [deskPos, setDeskPos] = useState<{ left: number; top: number } | null>(null);

  // Desktop emoji portal position
  useLayoutEffect(() => {
    if (!emojiOpen || !emojiBtnRef.current) return;
    const r = emojiBtnRef.current.getBoundingClientRect();
    const GAP = 12, PICKER_W = 360, PICKER_H = 420;
    const left = Math.max(8, Math.min(r.right - PICKER_W, window.innerWidth - 8 - PICKER_W));
    const top = Math.max(8, r.top - GAP - PICKER_H);
    setDeskPos({ left, top });
  }, [emojiOpen]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    onFileSelect(file);
    e.target.value = "";
  };

  const insertEmojiAtCaret = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      onInputChange(input + emoji);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    onInputChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={clsx(
        "flex-shrink-0",
        "border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        "p-3 sm:p-4 md:rounded-b-2xl"
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      {/* Pending file preview */}
      {pendingFile && (
        <FilePreview file={pendingFile} onRemove={onRemoveFile} onLoad={onContentLoad} />
      )}

      {/* Input container */}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
        <div className="flex items-end gap-2 p-3">
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              className="w-full resize-none outline-none bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100 text-base leading-relaxed"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Emoji button */}
            <div className="relative">
              <button
                ref={emojiBtnRef}
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                className={clsx(
                  "p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95",
                  emojiOpen && "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                )}
                title="Add emoji"
              >
                <Smile size={18} />
              </button>

              {/* Desktop picker via portal */}
              {emojiOpen && deskPos && typeof document !== "undefined" &&
                createPortal(
                  <div className="hidden sm:block fixed z-50" style={{ left: deskPos.left, top: deskPos.top }}>
                    <EmojiPopover
                      onSelect={(emoji) => {
                        insertEmojiAtCaret(emoji);
                        setEmojiOpen(false);
                      }}
                    />
                  </div>,
                  document.body
                )}

              {/* Mobile picker as a fixed sheet */}
              {emojiOpen && (
                <div className="sm:hidden fixed inset-x-4 bottom-32 z-50 rounded-xl overflow-hidden shadow-2xl bg-transparent" style={{ maxHeight: "65vh" }}>
                  <EmojiPopover
                    onSelect={(emoji) => {
                      insertEmojiAtCaret(emoji);
                      setEmojiOpen(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95",
                pendingFile && "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
              )}
              title="Attach image"
            >
              <Paperclip size={18} />
            </button>

            {/* Send button */}
            <button
              onClick={onSend}
              disabled={!canSend || sending}
              className={clsx(
                "p-2 rounded-full transition-all duration-200",
                canSend && !sending
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              )}
              title="Send message"
            >
              {sending ? (
                <div className="animate-spin">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                </div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
          <span className="sm:hidden">Tap send button or use Enter to send</span>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}