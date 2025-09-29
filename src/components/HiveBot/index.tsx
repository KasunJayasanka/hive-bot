// components/HiveBot/index.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { sendToHiveBot } from "@/services/hiveBot";
import { ChatItem, PendingFile } from "./types";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

// HTML entity decoder
function decodeHtmlEntities(str: string) {
  if (!str) return str;
  if (!/[&<>"']/.test(str) && !/&#?\w+;/.test(str)) return str;
  const ta = document.createElement("textarea");
  ta.innerHTML = str;
  return ta.value;
}

export default function HiveBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatItem[]>([
    { id: crypto.randomUUID(), role: "bot", text: "Hey there 👋\nHow can I help you today?" },
  ]);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [sending, setSending] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => !!input.trim() || !!pendingFile, [input, pendingFile]);

  // Mobile 100vh / keyboard safe layout (iOS visualViewport)
  useEffect(() => {
    const updateVvh = () => {
      const vh = typeof window !== "undefined" ? (window.visualViewport?.height ?? window.innerHeight) : 0;
      document.documentElement.style.setProperty("--vvh", `${vh * 0.01}px`);
    };
    updateVvh();
    window.visualViewport?.addEventListener("resize", updateVvh);
    window.addEventListener("orientationchange", updateVvh);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateVvh);
      window.removeEventListener("orientationchange", updateVvh);
    };
  }, []);

  // Auto-resize textarea effect moved to ChatInput

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = bodyRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    });
  }, []);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, scrollToBottom]);

  // Scroll when the container grows (images/fonts/layout)
  useEffect(() => {
    if (!bodyRef.current) return;
    const ro = new ResizeObserver(() => {
      scrollToBottom("smooth");
    });
    ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, [scrollToBottom]);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result);
      const base64 = dataUrl.split(",")[1];
      setPendingFile({ data: base64, mime_type: file.type, dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!canSend || sending) return;
    const userId = crypto.randomUUID();
    const botId = crypto.randomUUID();

    setMessages((m) => [
      ...m,
      { id: userId, role: "user", text: input.trim() || undefined, fileDataUrl: pendingFile?.dataUrl },
      { id: botId, role: "bot", text: undefined },
    ]);

    setSending(true);
    const inputToSend = input.trim();
    const fileToSend = pendingFile ? { ...pendingFile } : null;

    setPendingFile(null);
    setInput("");

    try {
      const payload = {
        message: inputToSend,
        file: fileToSend ? { data: fileToSend.data, mime_type: fileToSend.mime_type } : undefined,
      };
      const { text } = await sendToHiveBot(payload);
      const cleaned = decodeHtmlEntities(text ?? "");
      setMessages((m) => m.map((x) => (x.id === botId ? { ...x, text: cleaned || "…" } : x)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reach the server.";
      setMessages((m) => m.map((x) => (x.id === botId ? { ...x, text: `⚠️ ${msg}` } : x)));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col md:h-[600px] md:max-h-[600px]",
        "bg-white dark:bg-gray-900 shadow-xl md:rounded-2xl",
        "border border-gray-200 dark:border-gray-700"
      )}
      style={{
        height: "calc(var(--vvh, 1vh) * 100)",
      }}
    >
      <ChatHeader />

      <ChatMessages ref={bodyRef} messages={messages} onContentLoad={() => scrollToBottom("smooth")} />

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        onFileSelect={handleFileSelect}
        pendingFile={pendingFile}
        onRemoveFile={() => setPendingFile(null)}
        canSend={canSend}
        sending={sending}
        onContentLoad={() => scrollToBottom("smooth")}
      />
    </div>
  );
}