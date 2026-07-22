"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminAccess } from "@/lib/supabase/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const leadStatusSchema = z.enum(["new", "in_progress", "resolved", "spam"]);
const leadIdSchema = z.string().uuid();

function leadsRedirect(key: "notice" | "error", value: string): never {
  redirect(`/admin?view=contacts&${key}=${encodeURIComponent(value)}`);
}

export async function updateContactSubmissionStatusAction(
  formData: FormData,
): Promise<never> {
  const id = leadIdSchema.safeParse(formData.get("id"));
  const status = leadStatusSchema.safeParse(formData.get("status"));

  if (!id.success || !status.success) {
    leadsRedirect("error", "invalid-lead-update");
  }

  const access = await getAdminAccess();
  if (access.state === "unconfigured") redirect("/admin/login?error=unconfigured");
  if (access.state === "anonymous") redirect("/admin/login");
  if (access.state !== "authorized") redirect("/admin/login?error=forbidden");

  const supabase = await createServerSupabaseClient();
  if (!supabase) leadsRedirect("error", "cms-unavailable");

  const { error } = await supabase
    .from("contact_submissions")
    .update({ status: status.data })
    .eq("id", id.data);

  if (error) leadsRedirect("error", "lead-update-failed");
  revalidatePath("/admin");
  leadsRedirect("notice", "lead-updated");
}
