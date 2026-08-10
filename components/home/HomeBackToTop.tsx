import { ArrowUp } from "lucide-react";

export function HomeBackToTop() {
  return (
    <div className="bg-[#EEF1E9] px-5 pb-12 text-center sm:px-8 sm:pb-16">
      <a href="#dau-trang" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/20 bg-white/65 px-5 text-sm font-semibold text-[#29452C] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"><ArrowUp aria-hidden="true" className="size-4" /> Quay lại đầu trang</a>
    </div>
  );
}
