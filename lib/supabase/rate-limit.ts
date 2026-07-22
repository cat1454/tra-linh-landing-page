import "server-only";

import { createHmac } from "node:crypto";

import { headers } from "next/headers";

import { createAdminSupabaseClient } from "./admin";

function getRateLimitSecret(): string | null {
  return (
    process.env.RATE_LIMIT_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

export async function getRequestFingerprint(scope: string): Promise<string | null> {
  const secret = getRateLimitSecret();
  if (!secret) return null;

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 256) || "unknown";

  return createHmac("sha256", secret)
    .update(`${scope}:${ip}:${userAgent}`)
    .digest("hex");
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  return !error && data === true;
}
