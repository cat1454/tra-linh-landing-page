"use server";

import {
  contactSubmissionSchema,
  newsletterSubscriptionSchema,
} from "@/lib/validation/forms";
import type { PublicFormState } from "@/components/forms/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/lib/supabase/rate-limit";

export type FormActionState = PublicFormState;

function booleanField(value: FormDataEntryValue | null): boolean {
  return (
    value === "true" ||
    value === "on" ||
    value === "1" ||
    value === "accepted"
  );
}

function textField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function validationFailure(error: {
  flatten(): { fieldErrors: Record<string, string[] | undefined> };
}): FormActionState {
  const flattened = error.flatten().fieldErrors;
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]),
    ),
  );

  return {
    status: "error",
    message: "Vui lòng kiểm tra lại các trường được đánh dấu.",
    fieldErrors,
  };
}

export async function submitContactAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  if (!isSupabaseAdminConfigured()) {
    return {
      status: "disabled",
      message: "Biểu mẫu chưa hoạt động vì website chưa kết nối CMS.",
    };
  }

  const parsed = contactSubmissionSchema.safeParse({
    name: textField(formData.get("name")),
    email: textField(formData.get("email")),
    phone: textField(formData.get("phone")),
    message: textField(formData.get("message")),
    consent: booleanField(formData.get("consent")),
    website: textField(formData.get("website")),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const fingerprint = await getRequestFingerprint("contact");
  if (!fingerprint) {
    return {
      status: "disabled",
      message: "Biểu mẫu tạm thời chưa sẵn sàng. Vui lòng thử lại sau.",
    };
  }

  const allowed = await consumeRateLimit(`contact:${fingerprint}`, 5, 60 * 60);
  if (!allowed) {
    return {
      status: "rate_limited",
      message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau một giờ.",
    };
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return {
      status: "disabled",
      message: "Biểu mẫu tạm thời chưa sẵn sàng. Vui lòng thử lại sau.",
    };
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
    consent: parsed.data.consent,
    request_fingerprint: fingerprint,
  });

  if (error) {
    console.error("[contact] Unable to persist a validated submission.");
    return {
      status: "error",
      message: "Chưa thể gửi yêu cầu lúc này. Vui lòng thử lại sau.",
    };
  }

  return {
    status: "success",
    message: "Cảm ơn bạn. Yêu cầu đã được ghi nhận.",
  };
}

export async function subscribeNewsletterAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  if (!isSupabaseAdminConfigured()) {
    return {
      status: "disabled",
      message: "Đăng ký bản tin sẽ mở khi website kết nối CMS.",
    };
  }

  const parsed = newsletterSubscriptionSchema.safeParse({
    email: textField(formData.get("email")),
    consent: booleanField(formData.get("consent")),
    website: textField(formData.get("website")),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const fingerprint = await getRequestFingerprint("newsletter");
  if (!fingerprint) {
    return {
      status: "disabled",
      message: "Đăng ký bản tin tạm thời chưa sẵn sàng.",
    };
  }

  const allowed = await consumeRateLimit(
    `newsletter:${fingerprint}`,
    3,
    24 * 60 * 60,
  );
  if (!allowed) {
    return {
      status: "rate_limited",
      message: "Bạn đã thử đăng ký quá nhiều lần. Vui lòng quay lại vào ngày mai.",
    };
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return {
      status: "disabled",
      message: "Đăng ký bản tin tạm thời chưa sẵn sàng.",
    };
  }

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: parsed.data.email,
      consent: parsed.data.consent,
      status: "subscribed",
      request_fingerprint: fingerprint,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[newsletter] Unable to persist a validated subscription.");
    return {
      status: "error",
      message: "Chưa thể đăng ký lúc này. Vui lòng thử lại sau.",
    };
  }

  return {
    status: "success",
    message: "Bạn đã đăng ký nhận bản tin Trà Linh.",
  };
}
