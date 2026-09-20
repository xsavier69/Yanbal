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
          background: "#B5485D",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            fontSize: size * 0.52,
            fontWeight: 700,
            color: "#FFF8F3",
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
