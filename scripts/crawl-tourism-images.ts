import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  buildManifestEntry,
  deduplicateManifestEntries,
  extractImageReferences,
  type CandidateManifestEntry,
} from "../lib/tourism-image-crawler";

interface CrawlSource {
  slug: string;
  pageUrls: string[];
}

interface CrawlConfig {
  sources: CrawlSource[];
}

interface CrawlManifest {
  generatedAt: string;
  licenseDefault: "permission_required";
  entries: CandidateManifestEntry[];
  errors: Array<{ pageUrl: string; message: string }>;
}

class DomainRateLimiter {
  private readonly lastRequest = new Map<string, number>();
  private readonly delayMs: number;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  async wait(url: string) {
    const origin = new URL(url).origin;
    const elapsed = Date.now() - (this.lastRequest.get(origin) ?? 0);
    if (elapsed < this.delayMs) {
      await new Promise((resolveWait) => setTimeout(resolveWait, this.delayMs - elapsed));
    }
    this.lastRequest.set(origin, Date.now());
  }
}

interface RobotsRule {
  allow: boolean;
  path: string;
}

function parseRobotsRules(text: string): RobotsRule[] {
  const rules: RobotsRule[] = [];
  let appliesToAll = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      appliesToAll = value === "*";
      continue;
    }
    if (!appliesToAll || (field !== "allow" && field !== "disallow") || !value) continue;
    rules.push({ allow: field === "allow", path: value });
  }
  return rules;
}

class RobotsCache {
  private readonly rulesByOrigin = new Map<string, RobotsRule[]>();
  private readonly limiter: DomainRateLimiter;

  constructor(limiter: DomainRateLimiter) {
    this.limiter = limiter;
  }

  async canFetch(urlValue: string): Promise<boolean> {
    const url = new URL(urlValue);
    if (!this.rulesByOrigin.has(url.origin)) {
      try {
        const robotsUrl = new URL("/robots.txt", url.origin).href;
        await this.limiter.wait(robotsUrl);
        const response = await fetch(robotsUrl, {
          headers: { "user-agent": "TraLinhTourismImageReview/1.0" },
        });
        this.rulesByOrigin.set(
          url.origin,
          response.ok ? parseRobotsRules(await response.text()) : [],
        );
      } catch {
        this.rulesByOrigin.set(url.origin, []);
      }
    }

    const path = `${url.pathname}${url.search}`;
    const matches = (this.rulesByOrigin.get(url.origin) ?? [])
      .filter((rule) => path.startsWith(rule.path.replace(/\*.*$/, "")))
      .sort((left, right) => right.path.length - left.path.length);
    return matches[0]?.allow ?? true;
  }
}

function extensionForMime(mimeType: string, imageUrl: string): string {
  const known: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
  };
  return known[mimeType] ?? (extname(new URL(imageUrl).pathname).toLowerCase() || ".img");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithPolicy(
  url: string,
  limiter: DomainRateLimiter,
  robots: RobotsCache,
): Promise<Response> {
  if (!(await robots.canFetch(url))) throw new Error("Bị robots.txt chặn");
  await limiter.wait(url);
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      accept: "text/html,image/avif,image/webp,image/*,*/*;q=0.8",
      "user-agent": "TraLinhTourismImageReview/1.0",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function crawl(config: CrawlConfig, rootDirectory: string, delayMs: number) {
  const outputRoot = resolve(rootDirectory, "asset", "tourism-map-candidates");
  const limiter = new DomainRateLimiter(delayMs);
  const robots = new RobotsCache(limiter);
  const entries: CandidateManifestEntry[] = [];
  const errors: CrawlManifest["errors"] = [];
  const seenHashes = new Set<string>();

  for (const source of config.sources) {
    for (const pageUrl of source.pageUrls) {
      try {
        const pageResponse = await fetchWithPolicy(pageUrl, limiter, robots);
        const html = await pageResponse.text();
        const references = extractImageReferences(html, pageResponse.url || pageUrl).slice(0, 12);

        for (const reference of references) {
          try {
            const imageResponse = await fetchWithPolicy(reference.imageUrl, limiter, robots);
            const mimeType = (imageResponse.headers.get("content-type") ?? "")
              .split(";")[0]
              .toLowerCase();
            if (!mimeType.startsWith("image/")) continue;
            const bytes = new Uint8Array(await imageResponse.arrayBuffer());
            const metadata = await sharp(bytes, { animated: false }).metadata();
            if (!metadata.width || !metadata.height || metadata.width < 600 || metadata.height < 400) {
              continue;
            }
            const sha256 = createHash("sha256").update(bytes).digest("hex");
            if (seenHashes.has(sha256)) continue;
            seenHashes.add(sha256);

            const extension = extensionForMime(mimeType, reference.imageUrl);
            const absolutePath = resolve(outputRoot, source.slug, `${sha256.slice(0, 20)}${extension}`);
            await mkdir(dirname(absolutePath), { recursive: true });
            if (!(await fileExists(absolutePath))) await writeFile(absolutePath, bytes);
            entries.push(
              buildManifestEntry({
                ...reference,
                slug: source.slug,
                localPath: relative(rootDirectory, absolutePath).replaceAll("\\", "/"),
                mimeType,
                width: metadata.width,
                height: metadata.height,
                bytes,
                downloadedAt: new Date().toISOString(),
              }),
            );
          } catch (error) {
            errors.push({
              pageUrl,
              message: `${reference.imageUrl}: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }
      } catch (error) {
        errors.push({ pageUrl, message: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  const manifest: CrawlManifest = {
    generatedAt: new Date().toISOString(),
    licenseDefault: "permission_required",
    entries: deduplicateManifestEntries(entries),
    errors,
  };
  await mkdir(outputRoot, { recursive: true });
  await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function main() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const rootDirectory = resolve(scriptDirectory, "..");
  const configPath = resolve(rootDirectory, "data", "tourism-map", "image-crawl-sources.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as CrawlConfig;
  const delayArgument = process.argv.find((argument) => argument.startsWith("--delay-ms="));
  const delayMs = Math.max(250, Number(delayArgument?.split("=")[1] ?? 750) || 750);
  const manifest = await crawl(config, rootDirectory, delayMs);
  process.stdout.write(
    `Đã lưu ${manifest.entries.length} ảnh ứng viên; ${manifest.errors.length} lỗi.\n`,
  );
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  void main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
