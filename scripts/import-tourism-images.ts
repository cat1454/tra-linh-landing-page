import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditTourismMediaManifest,
  buildTourismMediaManifestEntry,
  optimizeTourismImage,
  type TourismMediaLicense,
  type TourismMediaManifestEntry,
  type TourismMediaRepresentation,
  type TourismMediaRole,
} from "../lib/tourism-image-pipeline";

interface ImportDefinition {
  assetId: string;
  slug: string;
  role: TourismMediaRole;
  sourcePath: string;
  publicPath: string;
  sourcePageUrl: string;
  sourceImageUrl: string;
  credit: string;
  license: TourismMediaLicense;
  representation: TourismMediaRepresentation;
}

interface ImportConfig {
  imports: ImportDefinition[];
  sharedAssetGroups: string[][];
}

function resolveInside(rootDirectory: string, relativePath: string): string {
  const resolved = resolve(rootDirectory, relativePath.replace(/^[/\\]+/, ""));
  if (!resolved.startsWith(`${rootDirectory}\\`) && !resolved.startsWith(`${rootDirectory}/`)) {
    throw new Error(`Đường dẫn nằm ngoài dự án: ${relativePath}`);
  }
  return resolved;
}

async function main() {
  const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const config = JSON.parse(
    await readFile(resolve(rootDirectory, "data/tourism-map/media-imports.json"), "utf8"),
  ) as ImportConfig;
  const entries: TourismMediaManifestEntry[] = [];
  const importedAt = new Date().toISOString();

  for (const definition of config.imports) {
    const sourcePath = resolveInside(rootDirectory, definition.sourcePath);
    const targetPath = resolveInside(rootDirectory, `public${definition.publicPath}`);
    const optimized = await optimizeTourismImage(await readFile(sourcePath));
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, optimized.bytes);
    entries.push(
      buildTourismMediaManifestEntry({
        ...definition,
        importedAt,
        optimized,
      }),
    );
  }

  const issues = auditTourismMediaManifest(entries, {
    sharedAssetGroups: config.sharedAssetGroups,
  });
  const errors = issues.filter(({ severity }) => severity === "error");
  if (errors.length) {
    throw new Error(errors.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  }

  const manifest = {
    generatedAt: importedAt,
    sharedAssetGroups: config.sharedAssetGroups,
    entries,
  };
  await writeFile(
    resolve(rootDirectory, "data/tourism-map/media-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(
    `Đã nhập ${entries.length} khai báo thành ${new Set(entries.map(({ publicPath }) => publicPath)).size} ảnh WebP local.\n`,
  );
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
