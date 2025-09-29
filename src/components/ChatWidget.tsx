"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import HiveBot from "@/components/HiveBot";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Chat Widget */}
            {open && (
                <div className="fixed bottom-20 right-4 z-50 w-[380px] max-h-[640px] rounded-2xl border border-indigo-100 bg-[var(--card)] shadow-2xl overflow-hidden">
                    <HiveBot />
                </div>
            )}

            {/* Toggle Button - Always in bottom right */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close chat" : "Open chat"}
                className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </>
    );
}