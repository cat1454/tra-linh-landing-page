import type { Metadata } from "next";

import Home from "@/app/page";

export const metadata: Metadata = {
  alternates: {
    canonical: "/vi",
    languages: { "vi-VN": "/vi", "en-US": "/en", "x-default": "/" },
  },
};

export default Home;
