"use client";

import { useState, type FormEvent } from "react";
import { LIMITS } from "@/lib/utils";
import { friendlyError } from "@/lib/friendlyError";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import PhotoField from "@/components/admin/settings/PhotoField";
import { usePhotoField } from "@/components/admin/settings/usePhotoField";
import type { SectionProps } from "@/components/admin/settings/types";

export default function InvitationSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [name, setName] = useState(settings.consultant_name ?? "");
  const [city, setCity] = useState(settings.city ?? "");
  const [years, setYears] = useState(
    settings.years_selling != null ? String(settings.years_selling) : ""
  );
  const [whyMe, setWhyMe] = useState(settings.why_me_custom ?? "");
  const [closing, setClosing] = useState(settings.closing_text ?? "");

  const photo = usePhotoField(settings.hero_photo_url, "portada");
  const signature = usePhotoField(settings.signature_url, "firma");

  const [yearsError, setYearsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    photo.dirty ||
    signature.dirty ||
    name !== (settings.consultant_name ?? "") ||
    city !== (settings.city ?? "") ||
    years !== (settings.years_selling != null ? String(settings.years_selling) : "") ||
    whyMe !== (settings.why_me_custom ?? "") ||
    closing !== (settings.closing_text ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setYearsError(null);

    const trimmedYears = years.trim();
    let parsedYears: number | null = null;
    if (trimmedYears) {
      if (!/^\d{1,2}$/.test(trimmedYears)) {
        setYearsError("Escribe solo el número de años. Ejemplo: 8");
        document.getElementById("inv-years")?.focus();
        return;
      }
      parsedYears = Number(trimmedYears);
    }

    setSaving(true);
    try {
      const [photoUrl, signatureUrl] = await Promise.all([
        photo.upload(),
        signature.upload(),
      ]);

      const failure = await onSave({
        consultant_name: name.trim() || null,
        city: city.trim() || null,
        years_selling: parsedYears,
        hero_photo_url: photoUrl,
        signature_url: signatureUrl,
        why_me_custom: whyMe.trim() || null,
        closing_text: closing.trim() || null,
      });
      if (failure) {
        setError(failure);
        return;
      }
      await photo.cleanUp(photoUrl);
      await signature.cleanUp(signatureUrl);
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err, "guardar los cambios"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      id="invitacion"
      title="Mi invitación"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-ink-soft">
          Esto es lo que ve quien entra a tu página por primera vez. Mientras
          un dato esté vacío, la página lo muestra entre corchetes.
        </p>

        <div>
          <label htmlFor="inv-name" className="field-label">
            Tu nombre
          </label>
          <input
            id="inv-name"
            type="text"
            maxLength={LIMITS.storeName}
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ejemplo: Amada"
          />
        </div>

        <div>
          <label htmlFor="inv-city" className="field-label">
            Tu ciudad
          </label>
          <input
            id="inv-city"
            type="text"
            maxLength={LIMITS.leadCity}
            className="field-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ejemplo: Cuenca"
          />
        </div>

        <div>
          <label htmlFor="inv-years" className="field-label">
            Años como consultora
          </label>
          <input
            id="inv-years"
            type="text"
            inputMode="numeric"
            maxLength={2}
            className="field-input"
            aria-invalid={Boolean(yearsError)}
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="Ejemplo: 8"
          />
          {yearsError && (
            <p role="alert" className="field-error">
              {yearsError}
            </p>
          )}
        </div>

        <PhotoField
          id="inv-foto"
          label="Tu foto grande"
          help="De pie o de medio cuerpo, mirando a la cámara, con luz de día. Es lo primero que se ve."
          field={photo}
        />

        <PhotoField
          id="inv-firma"
          label="Tu firma"
          help="Firma en una hoja blanca con marcador grueso, tómale una foto de frente y súbela."
          field={signature}
          shape="wide"
        />

        <div>
          <label htmlFor="inv-why" className="field-label">
            Algo tuyo, con tus palabras
          </label>
          <textarea
            id="inv-why"
            className="field-input"
            style={{ minHeight: 90 }}
            maxLength={200}
            value={whyMe}
            onChange={(e) => setWhyMe(e.target.value)}
            placeholder="Ejemplo: Te acompaño a tus primeras visitas si quieres."
          />
          <p className="field-hint">
            {whyMe.length} / 200 letras. Se suma a la lista de &quot;Por qué
            empezar conmigo&quot;.
          </p>
        </div>

        <div>
          <label htmlFor="inv-closing" className="field-label">
            Tu despedida
          </label>
          <textarea
            id="inv-closing"
            className="field-input"
            style={{ minHeight: 110 }}
            maxLength={400}
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            placeholder="Ejemplo: Si llegaste hasta aquí, escríbeme sin pena. Conversamos y tú decides."
          />
          <p className="field-hint">{closing.length} / 400 letras</p>
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
