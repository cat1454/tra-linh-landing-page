import { tourismEvents } from "../data/tourism-map/events";
import { tourismPlaces } from "../data/tourism-map/places";
import {
  auditTourismEntities,
  formatTourismDataQualityReport,
  summarizeTourismDataQuality,
} from "../lib/tourism-map-quality";

const report = auditTourismEntities([...tourismPlaces, ...tourismEvents]);
const summary = summarizeTourismDataQuality(report);
const jsonMode = process.argv.includes("--json");

process.stdout.write(
  `${
    jsonMode
      ? JSON.stringify({ summary, issues: report.issues }, null, 2)
      : formatTourismDataQualityReport(report)
  }\n`,
);

if (summary.issues.error > 0) process.exitCode = 1;
