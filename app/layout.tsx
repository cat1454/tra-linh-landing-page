import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
import { FACEBOOK_PAGE_URL } from "@/lib/site-links";
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

export const metadata = baseMetadata;

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
  const locale = (await headers()).get("x-site-locale") === "en" ? "en" : "vi";

  return (
    <html lang={locale} className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-mist pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-jungle antialiased md:pb-0">
        <SmoothScrollProvider>
          <a className="skip-link" href="#noi-dung-chinh">
            Bỏ qua điều hướng
          </a>

          <div className="public-site-chrome contents">
            <Header locale={locale} />
          </div>

          {children}

          <div className="public-site-chrome contents">
            <Footer facebookUrl={FACEBOOK_PAGE_URL} locale={locale} />
            <MobileStickyCta />
          </div>
        </SmoothScrollProvider>

        <SpeedInsights />
      </body>
    </html>
  );
}
