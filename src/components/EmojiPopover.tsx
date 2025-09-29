"use client";

import { useEffect, useRef } from "react";

type Props = {
  onSelect: (emoji: string) => void;
  className?: string;
};

export default function EmojiPopover({ onSelect, className }: Props) {
  const ref = useRef<HTMLElement>(null);

  // Register the web component only on client
  useEffect(() => {
    import("emoji-picker-element");
  }, []);

  useEffect(() => {
    const picker = ref.current;
    if (!picker) return;

    // Ensure layout picks up explicit size
    picker.style.display = "block";
    picker.style.width = "100%";

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ unicode?: string }>;
      onSelect(custom?.detail?.unicode ?? "");
    };
    picker.addEventListener("emoji-click", handler);
    return () => picker.removeEventListener("emoji-click", handler);
  }, [onSelect]);

  return (
    <div className={`emoji-popover-container ${className || ""}`}>
      {/* @ts-expect-error: custom element */}
      <emoji-picker ref={ref} class="responsive-emoji-picker"></emoji-picker>
    </div>
  );
}
