"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, MapPin, UtensilsCrossed, Leaf, Wheat } from "lucide-react";
import Image from "next/image";
import type { LocalSpecialty } from "@/lib/content/types";

interface SpecialtyStoryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly specialty: LocalSpecialty | null;
}

const categoryMeta = {
  "am-thuc": { label: "Ẩm thực", icon: UtensilsCrossed },
  "duoc-lieu": { label: "Dược liệu", icon: Leaf },
  "nong-san": { label: "Nông sản", icon: Wheat },
};

const specialtyStories: Record<
  string,
  {
    title: string;
    introduction: string;
    details: string[];
    origin: string;
    preparation: string;
  }
> = {
  "ca-nien": {
    title: "Cá Niên Trà Linh",
    introduction: "Món quà tinh khiết từ những dòng suối lạnh trên đỉnh Ngọc Linh.",
    details: [
      "Cá niên (hay cá sỉnh cao) sống ở những vùng nước trong, chảy xiết của các con suối vùng cao Trà Linh. Cá có thân dẹt, vảy bạc lấp lánh, thịt cá ngọt, săn chắc, thơm ngọt tự nhiên và có vị đắng nhẹ đặc trưng ở phần ruột.",
      "Đây là loài cá cực kỳ nhạy cảm với môi trường; chúng chỉ sinh trưởng được ở những dòng suối mát lạnh và hoàn toàn tinh khiết. Do đó, sự hiện diện của cá niên là minh chứng sinh thái cho sự trong lành của nguồn nước vùng Ngọc Linh."
    ],
    origin: "Đánh bắt thủ công tại hệ thống suối tự nhiên quanh các nóc bản thuộc xã Trà Linh.",
    preparation: "Nướng mộc trên than củi chấm muối ớt xiêm rừng, hoặc kho nghệ, làm gỏi cá."
  },
  "mang-rung": {
    title: "Măng Rừng Trà Linh",
    introduction: "Hương vị mộc mạc lưu giữ trọn vẹn sự tinh túy của đất trời.",
    details: [
      "Măng rừng Trà Linh mọc tự nhiên trên các sườn núi cao mát ẩm quanh năm. Những búp măng non tơ được bà con Xơ Đăng thu hái từ sáng sớm khi sương núi còn chưa tan.",
      "Vị ngọt giòn xen lẫn vị đắng nhẹ của măng rừng tự nhiên khi kết hợp cùng muối ớt tiêu rừng tạo nên hương vị mộc mạc nhưng khó quên, mang đậm hơi thở của rừng già Ngọc Linh."
    ],
    origin: "Hái tự nhiên từ sườn núi cao thuộc xã Trà Linh dưới tán rừng phòng hộ Ngọc Linh.",
    preparation: "Ăn kèm muối ớt tiêu rừng, xào tỏi, luộc chấm muối vừng hoặc ủ chua nấu cá suối."
  },
  "ga-nuong": {
    title: "Gà Nướng Bản Địa",
    introduction: "Hương vị đậm đà được hun đúc từ tập quán thả rông dưới tán rừng.",
    details: [
      "Gà bản địa Trà Linh được người dân nuôi thả rông tự nhiên dưới tán rừng phòng hộ và quanh các nóc bản. Gà tự tìm kiếm thức ăn như hạt cỏ, kiến, côn trùng nên thịt rất săn chắc và thơm ngọt.",
      "Khi nướng trên lửa than hồng, gà tỏa ra hương thơm ngào ngạt kết hợp cùng các loại gia vị đặc trưng núi rừng sưởi ấm lòng người viễn khách giữa sương mờ Ngọc Linh."
    ],
    origin: "Nuôi thả tự nhiên dưới tán rừng tại các nóc bản thuộc xã Trà Linh.",
    preparation: "Ướp kỹ cùng hạt dổi, mắc khén, muối hạt, ớt rừng rồi kẹp thanh tre nướng củi hồng."
  }
};

export function SpecialtyStoryModal({ isOpen, onClose, specialty }: SpecialtyStoryModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const elements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !specialty) return null;

  const meta = categoryMeta[specialty.category];
  const Icon = meta?.icon;
  const story = specialtyStories[specialty.slug] ?? {
    title: specialty.name,
    introduction: "Sản vật ẩm thực và đời sống mộc mạc vùng cao.",
    details: [specialty.description],
    origin: "Xã Trà Linh, Ngọc Linh.",
    preparation: "Chế biến truyền thống theo tập quán của đồng bào bản địa."
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 p-4 backdrop-blur-md flex justify-center items-start"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        className="relative w-full max-w-2xl my-auto rounded-[1.75rem] md:rounded-[2rem] bg-[#EEF1E9] text-[#10251A] shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden"
        initial={prefersReducedMotion ? false : { scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
      >
        {/* Top media banner */}
        <div className="relative aspect-[16/10] w-full bg-[#D8DDCF] shrink-0">
          <Image
            src={specialty.media.src}
            alt={specialty.media.altText}
            fill
            sizes="(max-width: 768px) 100vw, 42rem"
            className="object-cover"
            priority
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#EEF1E9] via-transparent to-black/30" />
          <button
            ref={closeRef}
            type="button"
            aria-label="Đóng câu chuyện"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white hover:bg-black/55 hover:border-white transition-colors backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        {/* Modal content details */}
        <div className="px-6 pb-8 pt-4 sm:px-8 sm:pb-10">
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10251A]/10 bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#435348] backdrop-blur-sm">
                <Icon aria-hidden="true" className="size-3.5 text-[#5E7F3B]" />
                {meta.label}
              </span>
            )}
          </div>

          <h2 id={titleId} className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {story.title}
          </h2>
          <p className="mt-2 text-base font-medium italic text-[#5E7F3B] sm:text-lg">
            {story.introduction}
          </p>

          <hr className="my-5 border-[#10251A]/10" />

          <div className="space-y-4 text-[#435348] text-sm sm:text-base leading-7">
            {story.details.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#10251A]/10 pt-5 sm:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10251A]/80">
                <MapPin className="size-3.5 text-[#5E7F3B]" />
                Nguồn gốc
              </h4>
              <p className="mt-1.5 text-xs leading-5 text-[#536258]">{story.origin}</p>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10251A]/80">
                <UtensilsCrossed className="size-3.5 text-[#5E7F3B]" />
                Chế biến gợi ý
              </h4>
              <p className="mt-1.5 text-xs leading-5 text-[#536258]">{story.preparation}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
