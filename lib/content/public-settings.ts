export interface PublicSiteSettings {
  contactEmail?: string;
  contactPhone?: string;
  zaloUrl?: string;
  mapsUrl?: string;
  privacyUrl?: string;
}

interface PublicSiteSettingsRow {
  contact_email?: string | null;
  contact_phone?: string | null;
  zalo_url?: string | null;
  maps_url?: string | null;
  privacy_url?: string | null;
}

function trimmed(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function safeEmail(value: string | null | undefined): string | undefined {
  const normalized = trimmed(value)?.toLowerCase();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? normalized
    : undefined;
}

function safePhone(value: string | null | undefined): string | undefined {
  const normalized = trimmed(value);
  if (!normalized || !/^\+?[0-9][0-9\s().-]{7,19}$/.test(normalized)) {
    return undefined;
  }

  return normalized.replace(/(?!^)\+|[^\d+]/g, "");
}

function safeUrl(
  value: string | null | undefined,
  allowRelative = false,
): string | undefined {
  const normalized = trimmed(value);
  if (!normalized) return undefined;
  if (allowRelative && normalized.startsWith("/") && !normalized.startsWith("//")) {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function normalizePublicSiteSettings(
  row: PublicSiteSettingsRow | null | undefined,
): PublicSiteSettings {
  return {
    contactEmail: safeEmail(row?.contact_email),
    contactPhone: safePhone(row?.contact_phone),
    zaloUrl: safeUrl(row?.zalo_url),
    mapsUrl: safeUrl(row?.maps_url),
    privacyUrl: safeUrl(row?.privacy_url, true),
  };
}
