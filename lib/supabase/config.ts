export type SupabaseEnvironmentStatus =
  | "unconfigured"
  | "public-only"
  | "ready";

export interface PublicSupabaseConfig {
  url: string;
  anonKey: string;
}

function nonEmpty(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isAllowedSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey || !isAllowedSupabaseUrl(url)) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseConfig() !== null;
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    getPublicSupabaseConfig() &&
      nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

export function getSupabaseEnvironmentStatus(): SupabaseEnvironmentStatus {
  if (!isSupabaseConfigured()) {
    return "unconfigured";
  }

  return isSupabaseAdminConfigured() ? "ready" : "public-only";
}

export function getMediaBucketName(): string {
  return nonEmpty(process.env.SUPABASE_MEDIA_BUCKET) ?? "media";
}

export function getSiteUrl(): string {
  const configured =
    nonEmpty(process.env.NEXT_PUBLIC_SITE_URL) ??
    nonEmpty(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    nonEmpty(process.env.VERCEL_URL);

  if (configured) {
    try {
      const url = new URL(
        configured.includes("://") ? configured : `https://${configured}`,
      );
      if (
        url.protocol === "https:" ||
        (url.protocol === "http:" &&
          (url.hostname === "localhost" || url.hostname === "127.0.0.1"))
      ) {
        return url.origin;
      }
    } catch {
      // Fall through to the development-safe default.
    }
  }

  return "http://localhost:3000";
}
