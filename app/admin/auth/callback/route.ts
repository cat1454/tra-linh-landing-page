import { NextResponse, type NextRequest } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null): string {
  return value?.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}

function loginRedirect(error: string) {
  return NextResponse.redirect(
    new URL(`/admin/login?error=${encodeURIComponent(error)}`, getSiteUrl()),
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return loginRedirect("invalid-link");

  const authClient = await createServerSupabaseClient();
  const adminClient = createAdminSupabaseClient();
  if (!authClient || !adminClient) return loginRedirect("unconfigured");

  const { error: exchangeError } = await authClient.auth.exchangeCodeForSession(code);
  if (exchangeError) return loginRedirect("invalid-link");

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();
  const email = user?.email?.trim().toLowerCase();

  if (userError || !user || !email) {
    await authClient.auth.signOut();
    return loginRedirect("invalid-link");
  }

  const { data: allowlisted, error: allowlistError } = await adminClient
    .from("admin_users")
    .select("id, user_id")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  if (allowlistError || !allowlisted) {
    await authClient.auth.signOut();
    return loginRedirect("forbidden");
  }

  if (allowlisted.user_id && allowlisted.user_id !== user.id) {
    await authClient.auth.signOut();
    return loginRedirect("forbidden");
  }

  const { error: bindError } = await adminClient
    .from("admin_users")
    .update({ user_id: user.id, last_sign_in_at: new Date().toISOString() })
    .eq("id", allowlisted.id);

  if (bindError) {
    await authClient.auth.signOut();
    return loginRedirect("session-failed");
  }

  return NextResponse.redirect(
    new URL(safeNextPath(request.nextUrl.searchParams.get("next")), getSiteUrl()),
  );
}
