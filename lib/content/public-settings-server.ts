import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

import {
  normalizePublicSiteSettings,
  type PublicSiteSettings,
} from "./public-settings";

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const config = getPublicSupabaseConfig();
  if (!config) return {};

  try {
    const client = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const { data, error } = await client
      .from("site_settings")
      .select("contact_email, contact_phone, zalo_url, maps_url, privacy_url")
      .eq("status", "published")
      .eq("is_placeholder", false)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    return error ? {} : normalizePublicSiteSettings(data);
  } catch {
    return {};
  }
}
