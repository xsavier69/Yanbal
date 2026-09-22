"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/compressImage";
import { friendlyError } from "@/lib/friendlyError";
import { checkPhotoFile, removeStoredImage } from "@/lib/storage";
import { LIMITS, normalizeWhatsappNumber } from "@/lib/utils";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import type { SectionProps } from "@/components/admin/settings/types";

export default function InfoSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState(settings.store_name ?? "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp_number ?? "");
  const [welcome, setWelcome] = useState(settings.welcome_message ?? "");
  const [aboutText, setAboutText] = useState(settings.about_text ?? "");
  const [deliveryArea, setDeliveryArea] = useState(settings.delivery_area ?? "");
  const [hours, setHours] = useState(settings.business_hours ?? "");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    settings.about_photo_url
  );
  const [compressing, setCompressing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const dirty =
    photoFile !== null ||
    storeName !== (settings.store_name ?? "") ||
    whatsapp !== (settings.whatsapp_number ?? "") ||
    welcome !== (settings.welcome_message ?? "") ||
    aboutText !== (settings.about_text ?? "") ||
    deliveryArea !== (settings.delivery_area ?? "") ||
    hours !== (settings.business_hours ?? "");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = checkPhotoFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressPhoto(file);
      setPhotoFile(compressed);
      setPhotoPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(compressed);
      });
    } catch {
      setError("No se pudo procesar la foto. Intenta con otra.");
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setWhatsappError(null);

    if (whatsapp.trim() && normalizeWhatsappNumber(whatsapp) === null) {
      setWhatsappError("Ese número no parece correcto. Escríbelo así: 0991234567");
      requestAnimationFrame(() => {
        const el = document.getElementById("whatsapp");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      });
      return;
    }

    setSaving(true);
    try {
      let aboutPhotoUrl = settings.about_photo_url;
      if (photoFile) {
        const supabase = createClient();
        const fileName = `sobre-mi-${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, photoFile, {
            contentType: "image/jpeg",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        aboutPhotoUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName).data.publicUrl;
      }

      const failure = await onSave({
        store_name: storeName.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
        welcome_message: welcome.trim() || null,
        about_text: aboutText.trim() || null,
        about_photo_url: aboutPhotoUrl,
        delivery_area: deliveryArea.trim() || null,
        business_hours: hours.trim() || null,
      });
      if (failure) {
        setError(failure);
        return;
      }

      if (photoFile && settings.about_photo_url !== aboutPhotoUrl) {
        await removeStoredImage(createClient(), settings.about_photo_url);
      }
      setPhotoFile(null);
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err, "guardar los cambios"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      id="info"
      title="Mi información"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            maxLength={LIMITS.whatsapp}
            aria-invalid={Boolean(whatsappError)}
            aria-describedby="whatsapp-ayuda"
            className="field-input"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ejemplo: 0991234567"
          />
          {whatsappError ? (
            <p id="whatsapp-ayuda" role="alert" className="field-error">
              {whatsappError}
            </p>
          ) : (
            <p id="whatsapp-ayuda" className="text-ink-soft text-sm mt-1">
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
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            placeholder="Ejemplo: Hola, gracias por escribirme..."
          />
        </div>

        <div className="border-t border-line pt-6 flex flex-col gap-6">
          <h3 className="font-heading text-xl font-bold text-ink">
            Sobre mí
          </h3>

          <div>
            <span className="field-label">Tu foto</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoChange}
              id="foto-sobre-mi"
              tabIndex={-1}
            />
            {photoPreview && (
              <div className="relative w-28 h-28 rounded-full overflow-hidden border border-line mb-3 bg-white mx-auto">
                <Image
                  src={photoPreview}
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
                : photoPreview
                ? "Cambiar mi foto"
                : "Subir mi foto"}
            </button>
          </div>

          <div>
            <label htmlFor="sobre-mi-texto" className="field-label">
              Tu presentación
            </label>
            <textarea
              id="sobre-mi-texto"
              className="field-input"
              style={{ minHeight: 120 }}
              maxLength={LIMITS.aboutText}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Hola, soy... Soy consultora Yanbal en... Escríbeme y con gusto te atiendo."
            />
            <p className="text-ink-soft text-sm mt-1">
              {aboutText.length} / {LIMITS.aboutText} letras
            </p>
          </div>

          <div>
            <label htmlFor="entrega" className="field-label">
              ¿Dónde entregas? (opcional)
            </label>
            <input
              id="entrega"
              type="text"
              maxLength={LIMITS.deliveryArea}
              className="field-input"
              value={deliveryArea}
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
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ejemplo: Lunes a sábado, 9am a 6pm"
            />
          </div>
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
