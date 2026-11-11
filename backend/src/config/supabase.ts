import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Manjka okoljska spremenljivka ${name}.`);
  }

  return value;
}

const supabaseUrl = getRequiredEnvironmentVariable("SUPABASE_URL");
const supabasePublishableKey = getRequiredEnvironmentVariable(
  "SUPABASE_PUBLISHABLE_KEY",
);

const options = {
  realtime: {
    transport: WebSocket as unknown as typeof globalThis.WebSocket,
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

export function createSupabaseAuthClient() {
  return createClient(supabaseUrl, supabasePublishableKey, options);
}

export const supabasePublic = createClient(
  supabaseUrl,
  supabasePublishableKey,
  options,
);

export function createSupabaseAdminClient() {
  return createClient(
    supabaseUrl,
    getRequiredEnvironmentVariable("SUPABASE_SECRET_KEY"),
    options,
  );
}
