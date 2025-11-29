// components/HiveBot/types.ts
export type Role = "user" | "bot";

export interface ChatItem {
  id: string;
  role: Role;
  text?: string;
  fileDataUrl?: string;
  sources?: string[];
}

export interface PendingFile {
  data: string;
  mime_type: string;
  dataUrl: string;
}