import { Fragment } from "react";

const EDITORIAL_PHRASES = new Map<string, readonly string[]>([
  [
    "Nơi mây ngàn ôm ấp báu vật đất trời",
    ["Nơi mây ngàn", "ôm ấp báu vật", "đất trời"],
  ],
  [
    "Vùng cao sống chan hòa cùng đại ngàn",
    ["Vùng cao sống chan hòa", "cùng đại ngàn"],
  ],
  [
    "Hành trình trải nghiệm xanh Trà Linh",
    ["Hành trình trải nghiệm xanh", "Trà Linh"],
  ],
  [
    "Nhịp sinh trưởng kiên nhẫn sâu trong rừng thẳm",
    ["Nhịp sinh trưởng", "kiên nhẫn", "sâu trong rừng thẳm"],
  ],
  [
    "Nhịp sống Xơ Đăng bình dị bên đỉnh Ngọc Linh",
    ["Nhịp sống Xơ Đăng", "bình dị bên đỉnh Ngọc Linh"],
  ],
  [
    "Tinh hoa ẩm thực & dược liệu Ngọc Linh",
    ["Tinh hoa ẩm thực", "& dược liệu Ngọc Linh"],
  ],
  [
    "Sản phẩm từ vùng dược liệu",
    ["Sản phẩm từ", "vùng dược liệu"],
  ],
  [
    "Báo chí viết về hành trình Trà Linh",
    ["Báo chí viết về", "hành trình Trà Linh"],
  ],
  [
    "Chuẩn bị cho hành trình an toàn, văn minh",
    ["Chuẩn bị cho hành trình", "an toàn, văn minh"],
  ],
  [
    "Khám phá Trà Linh trên bản đồ",
    ["Khám phá Trà Linh", "trên bản đồ"],
  ],
  [
    "Lắng nghe tiếng gọi từ mây ngàn Trà Linh",
    ["Lắng nghe tiếng gọi", "từ mây ngàn Trà Linh"],
  ],
  [
    "Trà Linh không chỉ để ngắm nhìn",
    ["Trà Linh", "không chỉ để ngắm nhìn"],
  ],
  [
    "Liên hệ thông tin & Hỗ trợ hành trình",
    ["Liên hệ thông tin", "& Hỗ trợ hành trình"],
  ],
  ["Kết nối với Trà Linh", ["Kết nối với", "Trà Linh"]],
  [
    "Hình ảnh hoạt động trải nghiệm thực tế",
    ["Hình ảnh hoạt động", "trải nghiệm thực tế"],
  ],
  [
    "Khoảnh khắc con người & đời sống",
    ["Khoảnh khắc", "con người", "& đời sống"],
  ],
  ["Tham quan có hướng dẫn", ["Tham quan", "có hướng dẫn"]],
  ["Trà Linh · vùng Ngọc Linh", ["Trà Linh", "· vùng Ngọc Linh"]],
  ["Đại ngàn nguyên sinh", ["Đại ngàn", "nguyên sinh"]],
  ["Bản sắc Xơ Đăng", ["Bản sắc", "Xơ Đăng"]],
  ["Dược liệu bản địa", ["Dược liệu", "bản địa"]],
  [
    "Nơi đại ngàn ôm trọn sương mờ",
    ["Nơi đại ngàn", "ôm trọn", "sương mờ"],
  ],
  [
    "Đời sống hòa nhịp cùng hơi thở rừng",
    ["Đời sống hòa nhịp", "cùng hơi thở rừng"],
  ],
  ["Trekking dưới tán rừng già", ["Trekking", "dưới tán rừng già"]],
  [
    "Bản làng Xơ Đăng trong sương",
    ["Bản làng Xơ Đăng", "trong sương"],
  ],
  [
    "Hành trình miền dược liệu quý",
    ["Hành trình", "miền dược liệu quý"],
  ],
  [
    "Sinh trưởng dưới bóng mát cổ thụ",
    ["Sinh trưởng", "dưới bóng mát", "cổ thụ"],
  ],
  [
    "Bàn tay bà con tận tụy giữ gìn",
    ["Bàn tay bà con", "tận tụy giữ gìn"],
  ],
  [
    "Quốc bảo trân quý vươn tầm thế giới",
    ["Quốc bảo trân quý", "vươn tầm", "thế giới"],
  ],
  ["Sàng sảy lúa mới ngày mùa", ["Sàng sảy lúa mới", "ngày mùa"]],
  [
    "Vẻ đẹp trang phục truyền thống Xơ Đăng",
    ["Vẻ đẹp trang phục", "truyền thống", "Xơ Đăng"],
  ],
  [
    "Đường đến bản sương mù Trà Linh",
    ["Đường đến", "bản sương mù", "Trà Linh"],
  ],
  [
    "Thời điểm vàng khám phá đại ngàn",
    ["Thời điểm vàng", "khám phá đại ngàn"],
  ],
  [
    "Quy tắc ứng xử văn minh nơi đại ngàn",
    ["Quy tắc ứng xử", "văn minh", "nơi đại ngàn"],
  ],
]);

const PROTECTED_NAMES = [
  ["Nam", "Trà", "My"],
  ["Sâm", "Ngọc", "Linh"],
  ["Ngọc", "Linh"],
  ["Trà", "Linh"],
  ["Xơ", "Đăng"],
  ["Tăk", "Ngo"],
  ["Tắk", "Ngo"],
  ["Tăk", "Lang"],
  ["Măng", "Lùng"],
  ["Kon", "Pin"],
  ["Noong", "Lau"],
] as const;

const PROTECTED_TERMS = ["đại ngàn", "báu vật"] as const;

const PROTECTED_INLINE_PATTERN =
  /(Nam Trà My|Ngọc Linh|Trà Linh|Xơ Đăng|Tăk Ngo|Tắk Ngo|Tăk Lang|Măng Lùng|Kon Pin|Noong Lau|đại ngàn|báu vật)/giu;

function normalizeHeading(text: string) {
  return text.trim().replace(/\s+/gu, " ");
}

function comparableWord(word: string) {
  return word
    .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")
    .toLocaleLowerCase("vi-VN");
}

function groupWordRun(words: string[]) {
  if (words.length === 0) return [];
  if (words.length <= 3) return [words.join(" ")];

  const phrases: string[] = [];
  let cursor = 0;

  if (words.length % 2 === 1) {
    phrases.push(words.slice(0, 3).join(" "));
    cursor = 3;
  }

  while (cursor < words.length) {
    phrases.push(words.slice(cursor, cursor + 2).join(" "));
    cursor += 2;
  }

  return phrases;
}

function mergeSingletonPhrases(phrases: string[]) {
  const merged: string[] = [];

  for (const phrase of phrases) {
    if (phrase.split(" ").length > 1 || merged.length === 0) {
      merged.push(phrase);
      continue;
    }

    merged[merged.length - 1] = `${merged.at(-1)} ${phrase}`;
  }

  if (merged.length > 1 && merged[0].split(" ").length === 1) {
    merged[1] = `${merged[0]} ${merged[1]}`;
    merged.shift();
  }

  return merged;
}

/**
 * Groups editable Vietnamese headings into short semantic phrases. Editorial
 * titles are hand-tuned; unknown copy receives a two-to-three-word fallback
 * while important local names remain intact.
 */
export function splitHeadingIntoPhrases(text: string): string[] {
  const normalized = normalizeHeading(text);
  if (!normalized) return [];

  const editorialPhrases = EDITORIAL_PHRASES.get(normalized);
  if (editorialPhrases) return [...editorialPhrases];

  const words = normalized.split(" ");
  const phrases: string[] = [];
  let pendingWords: string[] = [];

  const flushPendingWords = () => {
    phrases.push(...groupWordRun(pendingWords));
    pendingWords = [];
  };

  for (let index = 0; index < words.length; ) {
    const protectedName = PROTECTED_NAMES.find((candidate) =>
      candidate.every(
        (word, offset) =>
          comparableWord(words[index + offset] ?? "") ===
          word.toLocaleLowerCase("vi-VN"),
      ),
    );

    if (!protectedName) {
      pendingWords.push(words[index]);
      index += 1;
      continue;
    }

    flushPendingWords();
    phrases.push(words.slice(index, index + protectedName.length).join(" "));
    index += protectedName.length;
  }

  flushPendingWords();
  return mergeSingletonPhrases(phrases);
}

type SemanticHeadingTextProps = {
  text: string;
  compact?: boolean;
};

function ProtectedHeadingTerms({ text }: { text: string }) {
  return (
    <>
      {text.split(PROTECTED_INLINE_PATTERN).map((part, index) => {
        const isProtectedName = PROTECTED_NAMES.some(
          (name) =>
            name.join(" ").toLocaleLowerCase("vi-VN") ===
            part.toLocaleLowerCase("vi-VN"),
        );
        const isProtectedTerm = PROTECTED_TERMS.some(
          (term) =>
            term.toLocaleLowerCase("vi-VN") ===
            part.toLocaleLowerCase("vi-VN"),
        );

        return isProtectedName || isProtectedTerm ? (
          <span
            className="inline-block max-w-full whitespace-nowrap [overflow-wrap:normal]"
            data-heading-name={isProtectedName ? "true" : undefined}
            data-heading-term={isProtectedTerm ? "true" : undefined}
            key={`${index}-${part}`}
          >
            {part}
          </span>
        ) : (
          <Fragment key={`${index}-${part}`}>{part}</Fragment>
        );
      })}
    </>
  );
}

export function SemanticHeadingText({
  text,
  compact = false,
}: SemanticHeadingTextProps) {
  if (compact) {
    return <ProtectedHeadingTerms text={text} />;
  }

  const phrases = EDITORIAL_PHRASES.get(normalizeHeading(text));

  if (!phrases) {
    return <ProtectedHeadingTerms text={text} />;
  }

  return (
    <>
      {phrases.map((phrase, index) => (
        <Fragment key={`${index}-${phrase}`}>
          {index > 0 ? " " : null}
          <span
            className="max-w-full md:inline-block md:whitespace-nowrap md:[overflow-wrap:normal]"
            data-heading-phrase
          >
            <ProtectedHeadingTerms text={phrase} />
          </span>
        </Fragment>
      ))}
    </>
  );
}
