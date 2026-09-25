import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sé consultora Yanbal con una guía que te acompaña";

const MIDNIGHT = "#14213D";
const PORCELAIN = "#F6F7F9";
const PLATTER = "#ECEFF3";
const GOLD = "#B8955C";

/** Newsreader para el titular; si no se puede bajar, se usa la de por defecto. */
async function loadHeadingFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz@6..72&display=swap",
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

  const name = settings?.consultant_name?.trim() || "[TU NOMBRE]";
  const city = settings?.city?.trim() || "[CIUDAD]";
  const photo = settings?.hero_photo_url ?? null;
  const signatureUrl = settings?.signature_url ?? null;
  // Satori (el motor de next/og) no dibuja SVG de forma confiable como
  // <img>; para esta imagen estática solo se usa si la firma es una foto.
  const signaturePhoto =
    signatureUrl && !/\.svg(\?|#|$)/i.test(signatureUrl) ? signatureUrl : null;
  const font = await loadHeadingFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: MIDNIGHT,
        }}
      >
        {/* Su foto ocupa el tercio izquierdo */}
        <div
          style={{
            width: 420,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: PLATTER,
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              width={420}
              height={630}
              style={{ width: 420, height: 630, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: MIDNIGHT,
                fontSize: 26,
                textAlign: "center",
                padding: 40,
              }}
            >
              [FOTO DE ELLA]
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px 60px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: GOLD,
              marginBottom: 20,
            }}
          >
            Consultora independiente Yanbal · {city}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: font ? "Newsreader" : undefined,
              fontSize: 58,
              lineHeight: 1.15,
              color: PORCELAIN,
            }}
          >
            Te acompaño a empezar tu propio negocio con Yanbal.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginTop: 36,
              borderTop: `1px solid ${GOLD}`,
              paddingTop: 20,
            }}
          >
            {signaturePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signaturePhoto}
                alt=""
                height={72}
                style={{ height: 72, objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  fontFamily: font ? "Newsreader" : undefined,
                  fontSize: 30,
                  color: PORCELAIN,
                }}
              >
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Newsreader", data: font, style: "normal", weight: 500 }]
        : [],
    }
  );
}
