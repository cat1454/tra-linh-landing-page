"use client";

import { Download, MapPinned, Save } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import type { TourismPlace } from "@/data/tourism-map/types";
import {
  TOURISM_INTAKE_STORAGE_KEY,
  buildTourismIntakeExport,
  createTourismIntakeDraft,
  isTourismIntakeReady,
  type TourismIntakeDraft,
  type TourismIntakeDrafts,
} from "@/lib/tourism-map-intake";

interface TourismPlaceIntakeFormProps {
  entities: TourismPlace[];
}

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[#10251A]/15 bg-white px-4 py-3 text-[#10251A] outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#9BBE62]/35";
const storageEventName = "tra-linh-tourism-intake-change";

function initialDrafts(entities: TourismPlace[]): TourismIntakeDrafts {
  return Object.fromEntries(entities.map((entity) => [entity.slug, createTourismIntakeDraft(entity)]));
}

function subscribeToDrafts(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(storageEventName, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(storageEventName, onStoreChange);
  };
}

function getStoredDrafts() {
  return window.localStorage.getItem(TOURISM_INTAKE_STORAGE_KEY);
}

function persistDrafts(drafts: TourismIntakeDrafts) {
  window.localStorage.setItem(TOURISM_INTAKE_STORAGE_KEY, JSON.stringify(drafts));
  window.dispatchEvent(new Event(storageEventName));
}

function mergeLatestStoredDrafts(fallback: TourismIntakeDrafts): TourismIntakeDrafts {
  const stored = getStoredDrafts();
  if (!stored) return fallback;

  try {
    return { ...fallback, ...(JSON.parse(stored) as TourismIntakeDrafts) };
  } catch {
    return fallback;
  }
}

export function TourismPlaceIntakeForm({ entities }: TourismPlaceIntakeFormProps) {
  const [selectedSlug, setSelectedSlug] = useState(entities[0]?.slug ?? "");
  const [notice, setNotice] = useState("");
  const storedDrafts = useSyncExternalStore(subscribeToDrafts, getStoredDrafts, () => null);
  const { drafts, storageError } = useMemo(() => {
    const defaults = initialDrafts(entities);
    if (!storedDrafts) return { drafts: defaults, storageError: "" };
    try {
      const parsed = JSON.parse(storedDrafts) as TourismIntakeDrafts;
      for (const entity of entities) {
        if (parsed[entity.slug]) {
          defaults[entity.slug] = { ...defaults[entity.slug], ...parsed[entity.slug] };
        }
      }
      return { drafts: defaults, storageError: "" };
    } catch {
      return {
        drafts: defaults,
        storageError: "Không đọc được bản nháp cũ; bạn vẫn có thể nhập và xuất JSON mới.",
      };
    }
  }, [entities, storedDrafts]);
  const selectedDraft = drafts[selectedSlug];
  const completedCount = useMemo(
    () => Object.values(drafts).filter(isTourismIntakeReady).length,
    [drafts],
  );
  const storageNotice = storedDrafts
    ? "Đã nạp bản nháp đã lưu trên máy."
    : "Thay đổi được tự động lưu trên trình duyệt này.";

  if (!selectedDraft) return null;

  function updateField<Key extends keyof TourismIntakeDraft>(
    key: Key,
    value: TourismIntakeDraft[Key],
  ) {
    const latestDrafts = mergeLatestStoredDrafts(drafts);
    const latestSelectedDraft = latestDrafts[selectedSlug] ?? selectedDraft;
    persistDrafts({
      ...latestDrafts,
      [selectedSlug]: { ...latestSelectedDraft, [key]: value },
    });
    setNotice("");
  }

  function saveDraft() {
    const latestDrafts = mergeLatestStoredDrafts(drafts);
    const latestSelectedDraft = latestDrafts[selectedSlug] ?? selectedDraft;
    const nextDrafts = {
      ...latestDrafts,
      [selectedSlug]: { ...latestSelectedDraft, updatedAt: new Date().toISOString() },
    };
    persistDrafts(nextDrafts);
    setNotice(`Đã lưu bản nháp cho ${latestSelectedDraft.name}.`);
  }

  function exportJson() {
    const contents = JSON.stringify(buildTourismIntakeExport(drafts), null, 2);
    const url = URL.createObjectURL(new Blob([`${contents}\n`], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "tra-linh-tourism-intake.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Đã xuất file tra-linh-tourism-intake.json.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-3xl border border-[#10251A]/10 bg-white p-5 shadow-[0_20px_60px_rgba(16,37,26,0.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5E7F3B]">
              Bản nháp trên máy này
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
              {selectedDraft.name}
            </h2>
          </div>
          <span className="rounded-full bg-[#EEF1E9] px-4 py-2 text-sm font-semibold text-[#29452C]">
            Hoàn chỉnh {completedCount}/{entities.length}
          </span>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold">Địa điểm</span>
            <select
              aria-label="Địa điểm"
              value={selectedSlug}
              onChange={(event) => {
                setSelectedSlug(event.target.value);
                setNotice("");
              }}
              className={fieldClassName}
            >
              {entities.map((entity) => (
                <option key={entity.slug} value={entity.slug}>
                  {entity.sortOrder}. {entity.name}
                </option>
              ))}
            </select>
          </label>

          <IntakeField
            label="Địa chỉ hiện tại"
            value={selectedDraft.currentAddress}
            onChange={(value) => updateField("currentAddress", value)}
          />
          <IntakeField
            label="Địa chỉ cũ"
            value={selectedDraft.legacyAddress}
            onChange={(value) => updateField("legacyAddress", value)}
          />
          <IntakeField
            label="Vĩ độ (latitude)"
            type="number"
            step="any"
            placeholder="Ví dụ: 15.123456"
            value={selectedDraft.latitude}
            onChange={(value) => updateField("latitude", value)}
          />
          <IntakeField
            label="Kinh độ (longitude)"
            type="number"
            step="any"
            placeholder="Ví dụ: 108.123456"
            value={selectedDraft.longitude}
            onChange={(value) => updateField("longitude", value)}
          />
          <IntakeField
            label="Link Google Maps"
            type="url"
            placeholder="https://maps.google.com/..."
            value={selectedDraft.googleMapsUrl}
            onChange={(value) => updateField("googleMapsUrl", value)}
            wide
          />

          <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-[#D5A84E]/35 bg-[#EEE3CB]/45 p-4">
            <input
              type="checkbox"
              checked={selectedDraft.coordinateConfirmed}
              onChange={(event) => updateField("coordinateConfirmed", event.target.checked)}
              className="mt-1 size-5 accent-[#29452C]"
            />
            <span>
              <span className="block text-sm font-semibold">Tôi đã kiểm tra đúng vị trí này</span>
              <span className="mt-1 block text-xs leading-5 text-[#10251A]/65">
                Chỉ tọa độ được xác nhận mới được tôi gắn thành marker chính thức.
              </span>
            </span>
          </label>

          <IntakeTextArea
            label="Mô tả ngắn"
            value={selectedDraft.shortDescription}
            onChange={(value) => updateField("shortDescription", value)}
          />
          <IntakeTextArea
            label="Hướng dẫn tiếp cận / lưu ý tham quan"
            value={selectedDraft.accessNotes}
            onChange={(value) => updateField("accessNotes", value)}
          />
          <IntakeTextArea
            label="Thư mục hoặc tên file ảnh"
            hint="Mỗi file một dòng. Ví dụ: D:\\AnhTraLinh\\thac-noong-lau-01.jpg"
            value={selectedDraft.imageFiles}
            onChange={(value) => updateField("imageFiles", value)}
          />
          <IntakeTextArea
            label="Nguồn và quyền sử dụng ảnh"
            hint="Ghi tác giả, URL nguồn và xác nhận bạn có quyền dùng ảnh."
            value={selectedDraft.imageRights}
            onChange={(value) => updateField("imageRights", value)}
          />
          <IntakeTextArea
            label="URL nguồn thông tin"
            hint="Mỗi URL một dòng."
            value={selectedDraft.sourceUrls}
            onChange={(value) => updateField("sourceUrls", value)}
          />
          <IntakeTextArea
            label="Ghi chú cho tôi"
            value={selectedDraft.notes}
            onChange={(value) => updateField("notes", value)}
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#10251A]/10 pt-6">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#29452C] px-6 font-semibold text-white transition hover:bg-[#10251A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
          >
            <Save className="size-4" aria-hidden="true" />
            Lưu bản nháp
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#29452C]/20 bg-[#EEF1E9] px-6 font-semibold text-[#29452C] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
          >
            <Download className="size-4" aria-hidden="true" />
            Xuất JSON
          </button>
          <p className="min-h-6 text-sm text-[#49672D]" role="status" aria-live="polite">
            {notice || storageError || storageNotice}
          </p>
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-[#10251A]/10 bg-[#10251A] p-6 text-[#EEF1E9] lg:sticky lg:top-24">
        <span className="grid size-12 place-items-center rounded-full bg-white/10 text-[#D5A84E]">
          <MapPinned className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-serif text-2xl font-semibold">Thông tin cần nhập</h2>
        <ol className="mt-5 grid gap-3 text-sm leading-6 text-[#EEF1E9]/80">
          <li>1. Link Google Maps và cặp vĩ độ, kinh độ đúng.</li>
          <li>2. Địa chỉ hành chính hiện tại; địa chỉ cũ nếu có.</li>
          <li>3. Mô tả và lưu ý tiếp cận thực tế.</li>
          <li>4. Đường dẫn file ảnh gốc, không cần tự chuyển WebP.</li>
          <li>5. Tác giả, URL nguồn và quyền sử dụng từng nhóm ảnh.</li>
        </ol>
        <div className="mt-6 rounded-2xl bg-white/8 p-4 text-xs leading-5 text-[#EEF1E9]/70">
          Trang chỉ lưu vào trình duyệt của máy này. Khi nhập xong, bấm “Xuất JSON” rồi gửi file JSON và thư mục ảnh cho tôi.
        </div>
      </aside>
    </div>
  );
}

function IntakeField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  step,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        aria-label={label}
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      />
    </label>
  );
}

function IntakeTextArea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <span className="mt-1 block text-xs leading-5 text-[#10251A]/55">{hint}</span> : null}
      <textarea
        aria-label={label}
        value={value}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
      />
    </label>
  );
}
