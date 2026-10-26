import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cityOf, nameOf } from "@/lib/identity";
import { YANBAL_LOGO_PATH, YANBAL_LOGO_VIEWBOX } from "@/lib/yanbalLogo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sé consultora Yanbal con una guía que te acompaña";

const INK = "#231F20";
const SOFT = "#625A58";
const CORAL = "#F2683B";
const PEACH = "#FABEAC";

/** Instrument Serif para el titular; si no se puede bajar, se usa la de por defecto. */
async function loadHeadingFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const url = /src:\s*url\(([^)]+)\)/.exec(css)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const settings = isSupabaseConfigured
    ? await getSettings(await createClient())
    : null;

  const name = nameOf(settings).text;
  const city = cityOf(settings).text;
  const photo = settings?.hero_photo_url ?? null;
  const font = await loadHeadingFont();
  const [, , vw, vh] = YANBAL_LOGO_VIEWBOX.split(" ").map(Number);
  const logoH = 24;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFFFFF",
        }}
      >
        {/* Foto sobre un bloque coral desplazado, como en el catálogo */}
        <div
          style={{
            width: 470,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: CORAL,
          }}
        >
          <div
            style={{
              width: 330,
              height: 412,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: PEACH,
              color: INK,
              fontSize: 30,
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                width={330}
                height={412}
                style={{ width: 330, height: 412, objectFit: "cover" }}
              />
            ) : (
              "[FOTO]"
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px 56px 60px",
          }}
        >
          <svg
            width={(logoH * vw) / vh}
            height={logoH}
            viewBox={YANBAL_LOGO_VIEWBOX}
          >
            <path d={YANBAL_LOGO_PATH} fill={INK} fillRule="evenodd" />
          </svg>

          <div
            style={{
              display: "flex",
              fontFamily: font ? "Instrument Serif" : undefined,
              fontSize: 70,
              lineHeight: 1.04,
              color: INK,
            }}
          >
            Te acompaño a empezar tu propio negocio con Yanbal.
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: font ? "Instrument Serif" : undefined,
                fontSize: 38,
                color: INK,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: SOFT, marginTop: 6 }}>
              Consultora independiente Yanbal · {city}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Instrument Serif", data: font, style: "normal", weight: 400 }]
        : [],
    }
  );
}
