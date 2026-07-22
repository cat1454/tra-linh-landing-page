import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị nội dung | Trà Linh",
  robots: { follow: false, index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
