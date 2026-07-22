import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "./config";
import type { Database } from "./types";

export function createAdminSupabaseClient(): SupabaseClient<Database> | null {
  const config = getPublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!config || !serviceRoleKey) return null;

  return createClient<Database>(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
