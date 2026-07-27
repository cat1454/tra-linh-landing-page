export interface PublicSiteSettings {
  contactEmail?: string;
  contactPhone?: string;
  zaloUrl?: string;
  mapsUrl?: string;
  privacyUrl?: string;
  legalAddress?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  footerTitle?: string;
  footerDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  navigation?: Array<{ label: string; href: string }>;
}

interface PublicSiteSettingsRow {
  contact_email?: string | null;
  contact_phone?: string | null;
  zalo_url?: string | null;
  maps_url?: string | null;
  privacy_url?: string | null;
  legal_address?: string | null;
  header_title?: string | null;
  header_subtitle?: string | null;
  footer_title?: string | null;
  footer_description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  navigation?: unknown;
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
  const navigation = Array.isArray(row?.navigation)
    ? row.navigation.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label.trim() : "";
        const href = typeof record.href === "string"
          ? safeUrl(record.href, true)
          : undefined;
        return label && href ? [{ label, href }] : [];
      }).slice(0, 12)
    : undefined;

  return {
    contactEmail: safeEmail(row?.contact_email),
    contactPhone: safePhone(row?.contact_phone),
    zaloUrl: safeUrl(row?.zalo_url),
    mapsUrl: safeUrl(row?.maps_url),
    privacyUrl: safeUrl(row?.privacy_url, true),
    legalAddress: trimmed(row?.legal_address),
    ...(trimmed(row?.header_title) ? { headerTitle: trimmed(row?.header_title) } : {}),
    ...(trimmed(row?.header_subtitle) ? { headerSubtitle: trimmed(row?.header_subtitle) } : {}),
    ...(trimmed(row?.footer_title) ? { footerTitle: trimmed(row?.footer_title) } : {}),
    ...(trimmed(row?.footer_description) ? { footerDescription: trimmed(row?.footer_description) } : {}),
    ...(trimmed(row?.seo_title) ? { seoTitle: trimmed(row?.seo_title) } : {}),
    ...(trimmed(row?.seo_description) ? { seoDescription: trimmed(row?.seo_description) } : {}),
    ...(navigation?.length ? { navigation } : {}),
  };
}
