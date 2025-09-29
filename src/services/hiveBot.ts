// src/services/hiveBot.ts
import { http } from "@/lib/http";

export type HiveBotPayload = {
  message: string;
  file?: { data: string; mime_type: string } | null;
};

export type HiveBotResponse = {
  text: string;
};

export async function sendToHiveBot(payload: HiveBotPayload) {
  const { data } = await http.post<HiveBotResponse>("/api/hive-bot", payload);
  return data;
}
