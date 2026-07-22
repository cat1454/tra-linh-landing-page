import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";

import { subscribeNewsletterAction } from "@/app/actions/forms";
import { SmoothScrollProvider } from "@/components/animation/SmoothScrollProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteUrl, isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

export const metadata: Metadata = {
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
        url: "/images/tra-linh/og-social-card.jpg",
        width: 1200,
        height: 630,
        alt: "Trà Linh – Đại ngàn Ngọc Linh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trà Linh – Đại ngàn Ngọc Linh",
    description:
      "Khám phá thiên nhiên, văn hóa Xơ Đăng và vùng sâm Ngọc Linh.",
    images: ["/images/tra-linh/og-social-card.jpg"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1E9" },
    { media: "(prefers-color-scheme: dark)", color: "#10251A" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const formsEnabled = isSupabaseAdminConfigured();

  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-mist text-jungle antialiased">
        <SmoothScrollProvider>
          <a className="skip-link" href="#noi-dung-chinh">
            Bỏ qua điều hướng
          </a>

          <Header />

          {children}

          <Footer
            isNewsletterEnabled={formsEnabled}
            newsletterAction={subscribeNewsletterAction}
          />
        </SmoothScrollProvider>

        <SpeedInsights />
      </body>
    </html>
  );
}
