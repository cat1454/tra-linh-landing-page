import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminAccess: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/access", () => ({
  getAdminAccess: mocks.getAdminAccess,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { updateContactSubmissionStatusAction } from "@/app/actions/admin-leads";

function statusForm(status = "resolved") {
  const form = new FormData();
  form.set("id", "6f227a73-bf90-47d7-9e1f-44e8cbf31c92");
  form.set("status", status);
  return form;
}

describe("admin lead updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`);
    });
  });

  it("allows an authorized editor to update a lead status", async () => {
    mocks.getAdminAccess.mockResolvedValue({
      state: "authorized",
      email: "editor@example.com",
      role: "editor",
      userId: "user-1",
    });
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    mocks.createServerSupabaseClient.mockResolvedValue({ from });

    await expect(
      updateContactSubmissionStatusAction(statusForm()),
    ).rejects.toThrow("notice=lead-updated");

    expect(from).toHaveBeenCalledWith("contact_submissions");
    expect(update).toHaveBeenCalledWith({ status: "resolved" });
    expect(eq).toHaveBeenCalledWith(
      "id",
      "6f227a73-bf90-47d7-9e1f-44e8cbf31c92",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("rejects forged statuses before touching Supabase", async () => {
    mocks.getAdminAccess.mockResolvedValue({ state: "authorized" });
    const from = vi.fn();
    mocks.createServerSupabaseClient.mockResolvedValue({ from });

    await expect(
      updateContactSubmissionStatusAction(statusForm("deleted")),
    ).rejects.toThrow("error=invalid-lead-update");
    expect(from).not.toHaveBeenCalled();
  });

  it("redirects anonymous visitors before touching Supabase", async () => {
    mocks.getAdminAccess.mockResolvedValue({ state: "anonymous" });

    await expect(
      updateContactSubmissionStatusAction(statusForm()),
    ).rejects.toThrow("redirect:/admin/login");
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });
});
