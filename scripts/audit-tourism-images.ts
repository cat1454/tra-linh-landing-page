import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import mediaManifest from "../data/tourism-map/media-manifest.json";
import {
  auditTourismMediaFiles,
  auditTourismMediaManifest,
  type TourismMediaManifestEntry,
} from "../lib/tourism-image-pipeline";

async function main() {
  const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const entries = mediaManifest.entries as TourismMediaManifestEntry[];
  const manifestIssues = auditTourismMediaManifest(entries, {
    sharedAssetGroups: mediaManifest.sharedAssetGroups,
  });
  const fileIssues = await auditTourismMediaFiles(entries, (publicPath) =>
    readFile(resolve(rootDirectory, "public", publicPath.replace(/^[/\\]+/, ""))),
  );
  const issues = [...manifestIssues, ...fileIssues];
  const uniqueFiles = new Set(entries.map(({ publicPath }) => publicPath));
  const uniqueBytes = Array.from(uniqueFiles).reduce((total, publicPath) => {
    return total + (entries.find((entry) => entry.publicPath === publicPath)?.bytes ?? 0);
  }, 0);

  process.stdout.write(
    `Tourism images: ${entries.length} assignments, ${uniqueFiles.size} files, ${uniqueBytes} bytes, ${issues.length} issues.\n`,
  );
  for (const issue of issues) {
    process.stdout.write(
      `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.assetIds.join(", ")} — ${issue.message}\n`,
    );
  }
  if (issues.some(({ severity }) => severity === "error")) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
