import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";

import { SmoothScrollProvider } from "@/components/animation/SmoothScrollProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import {
  BRAND_LOGO_PATH,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SOCIAL_IMAGE_ALT,
  getSiteUrl,
} from "@/components/detail/seo";
import { getPublicSiteSettings } from "@/lib/content/public-settings-server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const siteUrl = getSiteUrl();

const baseMetadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "du lịch Trà Linh",
    "Nam Trà My",
    "văn hóa Xơ Đăng",
    "sâm Ngọc Linh",
    "dược liệu",
    "du lịch vùng cao",
    "sản phẩm địa phương",
  ],
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: 570,
        height: 350,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [BRAND_LOGO_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = settings.seoTitle;
  const description = settings.seoDescription;
  if (!title && !description) return baseMetadata;

  return {
    ...baseMetadata,
    title: title ?? baseMetadata.title,
    description: description ?? baseMetadata.description,
    openGraph: {
      ...baseMetadata.openGraph,
      title: title ?? baseMetadata.openGraph?.title,
      description: description ?? baseMetadata.openGraph?.description,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: title ?? baseMetadata.twitter?.title,
      description: description ?? baseMetadata.twitter?.description,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1E9" },
    { media: "(prefers-color-scheme: dark)", color: "#10251A" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getPublicSiteSettings();

  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-mist pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-jungle antialiased md:pb-0">
        <SmoothScrollProvider>
          <a className="skip-link" href="#noi-dung-chinh">
            Bỏ qua điều hướng
          </a>

          <div className="public-site-chrome contents">
            <Header
              title={siteSettings.headerTitle}
              subtitle={siteSettings.headerSubtitle}
              navigation={siteSettings.navigation}
            />
          </div>

          {children}

          <div className="public-site-chrome contents">
            <Footer
              contactEmail={siteSettings.contactEmail}
              contactPhone={siteSettings.contactPhone}
              title={siteSettings.footerTitle ?? siteSettings.headerTitle}
              description={siteSettings.footerDescription}
              legalAddress={siteSettings.legalAddress}
              privacyUrl={siteSettings.privacyUrl}
            />
            <MobileStickyCta
              contactPhone={siteSettings.contactPhone}
              mapsUrl={siteSettings.mapsUrl}
              zaloUrl={siteSettings.zaloUrl}
            />
          </div>
        </SmoothScrollProvider>

        <SpeedInsights />
      </body>
    </html>
  );
}
