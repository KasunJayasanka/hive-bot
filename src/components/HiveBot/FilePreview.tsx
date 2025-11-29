// components/HiveBot/FilePreview.tsx
import Image from "next/image";
import { X } from "lucide-react";
import { PendingFile } from "./types";

interface FilePreviewProps {
  file: PendingFile;
  onRemove: () => void;
  onLoad?: () => void;
}

export default function FilePreview({ file, onRemove, onLoad }: FilePreviewProps) {
  return (
    <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-slide-up">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 animate-scale-up">
        <Image
          src={file.dataUrl}
          alt="attachment preview"
          fill
          className="object-cover"
          unoptimized
          onLoad={onLoad}
        />
      </div>
      <div className="flex-1 text-sm">
        <div className="font-medium text-gray-900 dark:text-gray-100">Image attached</div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">Ready to send</div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        title="Remove"
      >
        <X size={16} />
      </button>
    </div>
  );
}