import type { TourismPlace } from "@/data/tourism-map/types";

export function TourismMediaAttribution({ place }: { place: TourismPlace }) {
  const coverAttributions = (place.mediaAttribution ?? []).filter(
    ({ role }) => role === "cover",
  );
  if (!coverAttributions.length) return null;

  const contextual = coverAttributions.some(
    ({ representation }) => representation !== "documentary",
  );
  const uniqueSources = Array.from(
    new Map(
      coverAttributions.map((attribution) => [
        `${attribution.credit}|${attribution.sourcePageUrl}`,
        attribution,
      ]),
    ).values(),
  );

  return (
    <p className="mt-3 text-sm leading-6 text-[#10251A]/60">
      {contextual ? "Ảnh minh họa theo bối cảnh Trà Linh. " : "Nguồn ảnh: "}
      {uniqueSources.map((source, index) => (
        <span key={`${source.assetId}-${source.sourcePageUrl}`}>
          {index ? ", " : ""}
          <a
            href={source.sourcePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#49672D] underline decoration-[#49672D]/35 underline-offset-2"
          >
            {source.credit}
          </a>
        </span>
      ))}
    </p>
  );
}
