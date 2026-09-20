"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/compressImage";
import { friendlyError } from "@/lib/friendlyError";
import { checkPhotoFile, removeStoredImage } from "@/lib/storage";
import { LIMITS, normalizeWhatsappNumber } from "@/lib/utils";
import type { Settings } from "@/lib/types";

const ABOUT_MAX = LIMITS.aboutText;

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: Settings | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState(
    initialSettings?.store_name ?? ""
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings?.whatsapp_number ?? ""
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialSettings?.welcome_message ?? ""
  );

  const [aboutPhotoFile, setAboutPhotoFile] = useState<File | null>(null);
  const [aboutPhotoPreview, setAboutPhotoPreview] = useState<string | null>(
    initialSettings?.about_photo_url ?? null
  );
  const [compressing, setCompressing] = useState(false);
  const [aboutText, setAboutText] = useState(initialSettings?.about_text ?? "");
  const [deliveryArea, setDeliveryArea] = useState(
    initialSettings?.delivery_area ?? ""
  );
  const [businessHours, setBusinessHours] = useState(
    initialSettings?.business_hours ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const photoProblem = checkPhotoFile(file);
    if (photoProblem) {
      setError(photoProblem);
      return;
    }
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressPhoto(file);
      setAboutPhotoFile(compressed);
      setAboutPhotoPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(compressed);
      });
    } catch {
      setError("No se pudo procesar la foto. Intenta con otra.");
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setWhatsappError(null);

    if (
      whatsappNumber.trim() &&
      normalizeWhatsappNumber(whatsappNumber) === null
    ) {
      setWhatsappError(
        "Ese número no parece correcto. Escríbelo así: 0991234567"
      );
      requestAnimationFrame(() => {
        const el = document.getElementById("whatsapp");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      });
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError(friendlyError(null, "guardar los cambios"));
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      let aboutPhotoUrl = initialSettings?.about_photo_url ?? null;

      if (aboutPhotoFile) {
        const fileName = `sobre-mi-${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, aboutPhotoFile, {
            contentType: "image/jpeg",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        aboutPhotoUrl = publicUrlData.publicUrl;
      }

      const { error: upsertError } = await supabase.from("settings").upsert({
        id: 1,
        store_name: storeName.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        welcome_message: welcomeMessage.trim() || null,
        about_text: aboutText.trim() || null,
        about_photo_url: aboutPhotoUrl,
        delivery_area: deliveryArea.trim() || null,
        business_hours: businessHours.trim() || null,
      });
      if (upsertError) throw upsertError;

      const previousPhoto = initialSettings?.about_photo_url ?? null;
      if (aboutPhotoFile && previousPhoto && previousPhoto !== aboutPhotoUrl) {
        await removeStoredImage(supabase, previousPhoto);
      }

      setSaved(true);
    } catch (err) {
      setError(friendlyError(err, "guardar los cambios"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-charcoal">
        Ajustes
      </h1>

      <div>
        <label htmlFor="nombre-tienda" className="field-label">
          Nombre de tu tienda
        </label>
        <input
          id="nombre-tienda"
          type="text"
          maxLength={LIMITS.storeName}
          className="field-input"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Ejemplo: Amada Ocaña Yanbal"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="field-label">
          Tu número de WhatsApp
        </label>
        <input
          id="whatsapp"
          type="text"
          inputMode="tel"
          className="field-input"
          value={whatsappNumber ?? ""}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          maxLength={LIMITS.whatsapp}
          aria-invalid={Boolean(whatsappError)}
          placeholder="Ejemplo: 0991234567"
        />
        {whatsappError ? (
          <p role="alert" className="field-error">
            {whatsappError}
          </p>
        ) : (
          <p className="text-charcoal-soft text-sm mt-1">
            Sin número, tus clientas no podrán escribirte desde la tienda.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bienvenida" className="field-label">
          Mensaje de bienvenida por WhatsApp
        </label>
        <textarea
          id="bienvenida"
          maxLength={LIMITS.welcomeMessage}
          className="field-input"
          style={{ minHeight: 90 }}
          value={welcomeMessage ?? ""}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          placeholder="Ejemplo: Hola, gracias por escribirme..."
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-heading text-xl font-bold text-charcoal mb-4">
          Sobre mí
        </h2>

        <div className="mb-5">
          <span className="field-label">Tu foto</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
            id="foto-sobre-mi"
          />
          {aboutPhotoPreview && (
            <div className="relative w-28 h-28 rounded-full overflow-hidden border border-border mb-3 bg-white mx-auto">
              <Image
                src={aboutPhotoPreview}
                alt="Tu foto"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
          >
            {compressing
              ? "Preparando la foto..."
              : aboutPhotoPreview
              ? "Cambiar mi foto"
              : "Subir mi foto"}
          </button>
        </div>

        <div className="mb-5">
          <label htmlFor="sobre-mi-texto" className="field-label">
            Tu presentación
          </label>
          <textarea
            id="sobre-mi-texto"
            className="field-input"
            style={{ minHeight: 120 }}
            maxLength={ABOUT_MAX}
            value={aboutText ?? ""}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="Hola, soy... Soy consultora Yanbal en... Escríbeme y con gusto te atiendo."
          />
          <p className="text-charcoal-soft text-sm mt-1">
            {(aboutText ?? "").length} / {ABOUT_MAX} letras
          </p>
        </div>

        <div className="mb-5">
          <label htmlFor="entrega" className="field-label">
            ¿Dónde entregas? (opcional)
          </label>
          <input
            id="entrega"
            type="text"
            maxLength={LIMITS.deliveryArea}
            className="field-input"
            value={deliveryArea ?? ""}
            onChange={(e) => setDeliveryArea(e.target.value)}
            placeholder="Ejemplo: Cuenca y alrededores"
          />
        </div>

        <div>
          <label htmlFor="horario" className="field-label">
            Horario de atención (opcional)
          </label>
          <input
            id="horario"
            type="text"
            maxLength={LIMITS.businessHours}
            className="field-input"
            value={businessHours ?? ""}
            onChange={(e) => setBusinessHours(e.target.value)}
            placeholder="Ejemplo: Lunes a sábado, 9am a 6pm"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="toast-error">
          {error}
        </p>
      )}
      {saved && <p className="toast-success">Cambios guardados ✓</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
