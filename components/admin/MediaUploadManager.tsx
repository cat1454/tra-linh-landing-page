"use client";

import { useState } from "react";
import * as tus from "tus-js-client";

import {
  finalizeMediaUploadAction,
  prepareMediaUploadAction,
} from "@/app/actions/admin-content";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { validateMediaUpload } from "@/lib/supabase/uploads";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "success" }
  | { kind: "error"; message: string };

function errorMessage(code: string) {
  const messages: Record<string, string> = {
    "invalid-file": "Tệp không hợp lệ.",
    "file-too-large": "Ảnh tối đa 10 MB và video tối đa 250 MB.",
    "invalid-extension": "Phần mở rộng không khớp định dạng tệp.",
    "cms-unavailable": "Supabase chưa được cấu hình.",
    "invalid-metadata": "Vui lòng nhập đủ tiêu đề và mô tả thay thế.",
    "save-failed": "Tệp đã tải lên nhưng chưa lưu được thông tin media.",
  };
  return messages[code] ?? "Không thể tải media lên.";
}

export function MediaUploadManager() {
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setState({ kind: "error", message: "Vui lòng chọn ảnh hoặc video." });
      return;
    }

    try {
      const validated = await validateMediaUpload(file);
      const prepared = await prepareMediaUploadAction({
        fileName: file.name,
        mimeType: validated.mimeType,
        fileSize: file.size,
      });
      if (!prepared.ok) {
        setState({ kind: "error", message: errorMessage(prepared.error) });
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setState({ kind: "error", message: "Supabase chưa được cấu hình." });
        return;
      }
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setState({ kind: "error", message: "Phiên đăng nhập đã hết hạn." });
        return;
      }

      setState({ kind: "uploading", progress: 0 });
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: prepared.endpoint,
          retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            "x-upsert": "false",
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          chunkSize: 6 * 1024 * 1024,
          metadata: {
            bucketName: prepared.bucket,
            objectName: prepared.storagePath,
            contentType: validated.mimeType,
            cacheControl: "31536000",
          },
          onError: reject,
          onProgress(bytesUploaded, bytesTotal) {
            setState({
              kind: "uploading",
              progress: Math.round((bytesUploaded / bytesTotal) * 100),
            });
          },
          onSuccess: () => resolve(),
        });
        void upload.findPreviousUploads().then((previous) => {
          if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        }).catch(reject);
      });

      data.set("storage_path", prepared.storagePath);
      data.set("mime_type", validated.mimeType);
      data.set("file_size", String(file.size));
      data.delete("file");
      const finalized = await finalizeMediaUploadAction(data);
      if (!finalized.ok) {
        setState({ kind: "error", message: errorMessage(finalized.error) });
        return;
      }

      form.reset();
      setState({ kind: "success" });
      window.location.reload();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload thất bại.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label>
        <span className="mb-2 block text-sm font-semibold">Tên dễ nhớ (bắt buộc)</span>
        <input name="title" required minLength={2} maxLength={180} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Mô tả nội dung ảnh/video (bắt buộc)</span>
        <input name="alt_text" required minLength={5} maxLength={300} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Đường dẫn nguồn (nếu lấy từ nơi khác)</span>
        <input name="source_url" type="url" className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Tên tác giả hoặc nguồn (nếu có)</span>
        <input name="source_credit" maxLength={300} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Ghi chú nơi dự định dùng (không bắt buộc)</span>
        <input name="section" placeholder="Ví dụ: ảnh đầu trang" maxLength={80} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold">Tệp media</span>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          required
          className="min-h-12 w-full rounded-xl border border-dashed border-[#10251a]/25 px-4 py-3"
        />
        <span className="mt-2 block text-xs text-[#10251a]/60">
          Ảnh tối đa 10 MB; video tối đa 250 MB. Upload có thể tiếp tục khi mạng gián đoạn.
        </span>
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state.kind === "uploading"}
          className="min-h-12 rounded-full bg-[#10251a] px-7 font-semibold text-white disabled:opacity-60"
        >
          {state.kind === "uploading" ? `Đang tải ${state.progress}%` : "Tải media lên"}
        </button>
        {state.kind === "error" ? <p role="alert" className="mt-3 text-sm text-red-700">{state.message}</p> : null}
        {state.kind === "success" ? <p className="mt-3 text-sm text-green-700">Đã tải media và lưu vào thư viện.</p> : null}
      </div>
    </form>
  );
}
