import type { MetadataRoute } from "next";

import { getAbsoluteUrl, getSiteUrl } from "@/components/detail/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
