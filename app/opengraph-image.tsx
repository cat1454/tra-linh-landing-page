import { ImageResponse } from "next/og";

export const alt =
  "Trà Linh – Đại ngàn Ngọc Linh, văn hóa Xơ Đăng và sản vật vùng cao";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 76% 28%, rgba(155, 190, 98, 0.34), transparent 28%), linear-gradient(135deg, #10251A 0%, #1C3A29 58%, #5E7F3B 100%)",
          color: "#EEF1E9",
          display: "flex",
          height: "100%",
          padding: "68px 76px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(238, 241, 233, 0.3)",
            borderRadius: "34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 58px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#D5A84E",
              display: "flex",
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: "0.24em",
            }}
          >
            TRÀ LINH · VÙNG NGỌC LINH
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.03,
                maxWidth: 920,
              }}
            >
              Đại ngàn Ngọc Linh
            </div>
            <div
              style={{
                color: "#DDE7D2",
                display: "flex",
                fontSize: 31,
                lineHeight: 1.3,
                marginTop: 20,
              }}
            >
              Thiên nhiên · Văn hóa Xơ Đăng · Sản vật vùng cao
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              color: "#C9D4C3",
              display: "flex",
              fontSize: 23,
              justifyContent: "space-between",
            }}
          >
            <span>Vùng Nam Trà My, Quảng Nam</span>
            <span>Xã Trà Linh, thành phố Đà Nẵng</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
