"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSiteUrl,
  getSupabaseEnvironmentStatus,
} from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/lib/supabase/rate-limit";

const emailSchema = z.string().trim().toLowerCase().email().max(254);

export async function requestAdminMagicLink(formData: FormData): Promise<never> {
  if (getSupabaseEnvironmentStatus() !== "ready") {
    redirect("/admin/login?error=unconfigured");
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/admin/login?error=invalid-email");

  const fingerprint = await getRequestFingerprint("admin-magic-link");
  if (
    !fingerprint ||
    !(await consumeRateLimit(`admin-magic-link:${fingerprint}`, 5, 60 * 60))
  ) {
    redirect("/admin/login?error=rate-limited");
  }

  const adminClient = createAdminSupabaseClient();
  const authClient = await createServerSupabaseClient();
  if (!adminClient || !authClient) {
    redirect("/admin/login?error=unconfigured");
  }

  const { data: allowlisted, error: allowlistError } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("email", parsed.data)
    .eq("is_active", true)
    .maybeSingle();

  // Use the same confirmation message for unknown and known addresses to avoid
  // exposing membership of the administrative allowlist.
  if (allowlistError || !allowlisted) {
    redirect("/admin/login?notice=check-email");
  }

  const { error } = await authClient.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${getSiteUrl()}/admin/auth/callback?next=/admin`,
      shouldCreateUser: true,
    },
  });

  if (error) redirect("/admin/login?error=send-failed");
  redirect("/admin/login?notice=check-email");
}

export async function signOutAdmin(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login?notice=signed-out");
}
