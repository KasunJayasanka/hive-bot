import { createClient } from "@supabase/supabase-js";

// server-only client (do not import in client components)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { headers: { "x-application-name": "hive-bot-rag" } },
  }
);
