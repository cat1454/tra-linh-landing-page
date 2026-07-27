import { spawnSync } from "node:child_process";
import path from "node:path";

const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";

const result = spawnSync(process.execPath, [nextCli, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: baseUrl,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.E2E_MAPBOX_ACCESS_TOKEN?.trim() ?? "",
    NEXT_PUBLIC_MAPBOX_STYLE_URL:
      process.env.E2E_MAPBOX_STYLE_URL?.trim() ??
      "mapbox://styles/mapbox/standard",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "sb_secret_e2e",
    RATE_LIMIT_SALT: "tra-linh-e2e-rate-limit-salt",
    SUPABASE_MEDIA_BUCKET: "media",
  },
});

process.exit(result.status ?? 1);
