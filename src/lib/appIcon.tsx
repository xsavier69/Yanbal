import { ImageResponse } from "next/og";

export function renderAppIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14213D",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            fontSize: size * 0.52,
            fontWeight: 700,
            color: "#F6F7F9",
            fontFamily: "sans-serif",
          }}
        >
          M
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
