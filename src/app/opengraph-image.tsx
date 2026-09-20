import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);
  const storeName = settings?.store_name?.trim() || "Mi tienda Yanbal";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF8F3",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#3A2E2E",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {storeName}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 600,
            color: "#8F3549",
            background: "#F6DDC4",
            border: "2px solid #E8A87C",
            borderRadius: 999,
            padding: "10px 28px",
          }}
        >
          Página de consultora independiente Yanbal
        </div>
      </div>
    ),
    { ...size }
  );
}
