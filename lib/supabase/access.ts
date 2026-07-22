import "server-only";

import { createServerSupabaseClient } from "./server";

export type AdminAccess =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "forbidden"; email: string | null }
  | {
      state: "authorized";
      email: string;
      role: "admin" | "editor";
      userId: string;
    };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { state: "unconfigured" };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { state: "anonymous" };

  const email = user.email?.trim().toLowerCase() ?? null;
  if (!email) return { state: "forbidden", email: null };

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role, is_active, user_id")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !adminUser || adminUser.user_id !== user.id) {
    return { state: "forbidden", email };
  }

  return {
    state: "authorized",
    email,
    role: adminUser.role,
    userId: user.id,
  };
}
