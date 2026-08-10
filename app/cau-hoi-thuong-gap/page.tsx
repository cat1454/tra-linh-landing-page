import type { Metadata } from "next";
import Link from "next/link";

const questions = [
  { question: "Có thể tự vào rừng hoặc vườn sâm không?", answer: "Không nên. Nhiều khu vực chỉ tiếp nhận đoàn được tổ chức hoặc cần người dẫn đường và sự đồng ý của đơn vị quản lý." },
  { question: "Khi nào là thời điểm phù hợp để đi?", answer: "Điều kiện vùng cao thay đổi nhanh. Hãy xem dự báo 7 ngày và xác nhận lại với đầu mối địa phương trước khi khởi hành." },
  { question: "Website có nhận đặt tour hoặc thanh toán không?", answer: "Không. Website cung cấp thông tin và kênh liên hệ chính thức; không thu thập thông tin đặt chỗ hoặc thanh toán." },
  { question: "Làm sao lưu lịch trình để xem ngoại tuyến?", answer: "Trên trang hành trình, chọn “In hoặc lưu PDF” rồi dùng chức năng lưu PDF của trình duyệt." },
  { question: "Thông tin nào còn đang xác minh?", answer: "Các trường chưa có nguồn chính thức, như một số mức độ khó, mùa phù hợp, quãng đường hoặc chi phí, được ghi rõ “Đang xác minh” và không được tự ước tính." },
  { question: "Làm sao kiểm tra nguồn gốc sâm Ngọc Linh?", answer: "Website không cấp tem hoặc chứng nhận sản phẩm. Không mua chỉ dựa trên hình ảnh hay nội dung giới thiệu; hãy yêu cầu hồ sơ truy xuất từ bên bán và xác nhận với cơ quan hoặc đầu mối địa phương trước khi giao dịch." },
];

export const metadata: Metadata = { title: "Câu hỏi thường gặp", description: "Giải đáp các câu hỏi thường gặp khi chuẩn bị chuyến đi Trà Linh.", alternates: { canonical: "/cau-hoi-thuong-gap" } };

export default function FrequentlyAskedQuestionsPage() {
  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#EEF1E9] px-5 pb-20 pt-32 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl"><Link href="/" className="text-sm text-[#536258] underline underline-offset-4">Về trang chủ</Link><header className="mt-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5E7F3B]">Hỗ trợ hành trình</p><h1 className="mt-4 font-serif text-4xl text-[#10251A] sm:text-6xl">Câu hỏi thường gặp</h1></header>
        <div className="mt-10 grid gap-4">{questions.map((item) => <details key={item.question} className="group rounded-2xl border border-[#10251A]/10 bg-white p-6"><summary className="cursor-pointer list-none pr-8 font-semibold text-[#10251A] marker:content-none">{item.question}</summary><p className="mt-4 leading-7 text-[#405347]">{item.answer}</p></details>)}</div>
        <p className="mt-10 text-[#405347]">Chưa thấy câu trả lời? <Link href="/#lien-he" className="font-semibold text-[#29452C] underline underline-offset-4">Liên hệ đầu mối địa phương</Link>.</p>
      </div>
    </main>
  );
}
