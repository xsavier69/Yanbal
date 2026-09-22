import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeEcuadorMobile } from "@/lib/join";
import { LEAD_SOURCES, AVAILABILITY_OPTIONS } from "@/lib/types";
import { notifyNewLead } from "@/lib/notify";

export const runtime = "nodejs";

const GENERIC_ERROR =
  "No se pudo enviar. Revisa tu internet e inténtalo otra vez.";

/**
 * Identifica la conexión sin guardar la dirección IP en claro.
 * El salt hace que el hash no se pueda revertir a una IP concreta.
 */
function hashIp(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "desconocida";
  const salt = process.env.LEAD_SALT ?? "yanbal-sin-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: GENERIC_ERROR },
      { status: 400 }
    );
  }

  // Trampa 1: un campo que una persona nunca ve ni llena.
  // Trampa 2: nadie escribe un formulario entero en menos de 3 segundos.
  // A los robots les respondemos "ok" para que no sepan que fueron detectados.
  const honeypot = String(body.website ?? "").trim();
  const elapsed = Number(body.elapsed ?? 0);
  if (honeypot || (Number.isFinite(elapsed) && elapsed < 3000)) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const phone = normalizeEcuadorMobile(String(body.phone ?? ""));
  const city = String(body.city ?? "").trim().slice(0, 60);
  const availabilityRaw = body.availability;
  const availability = AVAILABILITY_OPTIONS.some(
    (o) => o.value === availabilityRaw
  )
    ? (availabilityRaw as string)
    : null;
  const source = LEAD_SOURCES.includes(body.source as never)
    ? (body.source as string)
    : "directo";

  if (name.length < 2 || name.length > 60 || !phone) {
    return NextResponse.json(
      { ok: false, message: "Revisa tu nombre y tu número." },
      { status: 400 }
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { ok: false, message: "Marca la casilla para que pueda escribirte." },
      { status: 400 }
    );
  }

  // La configuración se mira al final: primero las comprobaciones baratas,
  // así las trampas siguen funcionando aunque falten las llaves.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, message: GENERIC_ERROR },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // submit_lead() es la única puerta: valida y limita antes de escribir.
  const { data, error } = await supabase.rpc("submit_lead", {
    p_name: name,
    p_phone: phone,
    p_city: city || null,
    p_availability: availability,
    p_consent: true,
    p_source: source,
    p_ip_hash: hashIp(request),
  });

  if (error) {
    console.error("No se pudo guardar la persona interesada:", error.message);
    return NextResponse.json(
      { ok: false, message: GENERIC_ERROR },
      { status: 500 }
    );
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string };
  if (!result.ok) {
    if (result.error === "rate") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Ya enviaste tus datos hace un momento. Espera un rato o escríbele por WhatsApp.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { ok: false, message: GENERIC_ERROR },
      { status: 400 }
    );
  }

  // El aviso por correo nunca debe tumbar el envío: si falla, solo se anota.
  await notifyNewLead({ name, city: city || null });

  return NextResponse.json({ ok: true });
}
