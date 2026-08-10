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
  },
});

process.exit(result.status ?? 1);
