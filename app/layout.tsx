import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";

import { SmoothScrollProvider } from "@/components/animation/SmoothScrollProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { getPublicSiteSettings } from "@/lib/content/public-settings-server";
import { getSiteUrl } from "@/lib/supabase/config";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AgentationWrapper } from "@/components/layout/AgentationWrapper";
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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trà Linh – Đại ngàn Ngọc Linh",
    template: "%s | Trà Linh",
  },
  description:
    "Khám phá thiên nhiên, văn hóa Xơ Đăng và vùng sâm Ngọc Linh tại xã Trà Linh, thành phố Đà Nẵng.",
  applicationName: "Trà Linh – Đại ngàn Ngọc Linh",
  authors: [{ name: "Trà Linh" }],
  creator: "Trà Linh",
  publisher: "Trà Linh",
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Trà Linh – Đại ngàn Ngọc Linh",
    title: "Trà Linh – Đại ngàn Ngọc Linh",
    description:
      "Một hành trình chậm qua đại ngàn, văn hóa Xơ Đăng và vùng sâm Ngọc Linh.",
    images: [
      {
        url: "/images/tra-linh/og-social-card-imagegen.jpg",
        width: 1200,
        height: 630,
        alt: "Phong cảnh minh họa đại ngàn cho trang giới thiệu Trà Linh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trà Linh – Đại ngàn Ngọc Linh",
    description:
      "Khám phá thiên nhiên, văn hóa Xơ Đăng và vùng sâm Ngọc Linh.",
    images: ["/images/tra-linh/og-social-card-imagegen.jpg"],
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

          <Header
            title={siteSettings.headerTitle}
            subtitle={siteSettings.headerSubtitle}
            navigation={siteSettings.navigation}
          />

          {children}

          <Footer
            contactEmail={siteSettings.contactEmail}
            contactPhone={siteSettings.contactPhone}
            title={siteSettings.footerTitle ?? siteSettings.headerTitle}
            description={siteSettings.footerDescription}
          />
          <MobileStickyCta
            contactPhone={siteSettings.contactPhone}
            mapsUrl={siteSettings.mapsUrl}
            zaloUrl={siteSettings.zaloUrl}
          />
        </SmoothScrollProvider>

        <SpeedInsights />
        <AgentationWrapper />
      </body>
    </html>
  );
}
