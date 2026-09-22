"use client";

import { useState, type FormEvent } from "react";
import {
  getCampaignState,
  safeHttpUrl,
  todayInEcuador,
} from "@/lib/campaign";
import { LIMITS } from "@/lib/utils";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";

type Errors = { number?: string; date?: string; url?: string };

export default function CampaignSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [visible, setVisible] = useState(isSectionVisible(settings, "campaign"));
  const [number, setNumber] = useState(
    settings.campaign_number ? String(settings.campaign_number) : ""
  );
  const [endDate, setEndDate] = useState(settings.campaign_end_date ?? "");
  const [url, setUrl] = useState(settings.official_catalog_url ?? "");
  const [today] = useState(() => todayInEcuador());

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    visible !== isSectionVisible(settings, "campaign") ||
    number !== (settings.campaign_number ? String(settings.campaign_number) : "") ||
    endDate !== (settings.campaign_end_date ?? "") ||
    url !== (settings.official_catalog_url ?? "");

  const parsedNumber = /^\d{1,2}$/.test(number.trim())
    ? Number(number.trim())
    : null;
  const preview = getCampaignState(parsedNumber, endDate || null, today);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const nextErrors: Errors = {};
    if (number.trim() && (parsedNumber === null || parsedNumber < 1)) {
      nextErrors.number = "Escribe solo el número de la campaña. Ejemplo: 10";
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      nextErrors.date = "Elige la fecha con el calendario.";
    }
    let cleanUrl: string | null = null;
    if (url.trim()) {
      cleanUrl = safeHttpUrl(url);
      if (!cleanUrl) {
        nextErrors.url =
          "Ese enlace no parece correcto. Cópialo completo desde tu navegador.";
      } else if (cleanUrl.length > LIMITS.url) {
        nextErrors.url = "El enlace es demasiado largo.";
      }
    }
    setErrors(nextErrors);
    const firstBad = (["number", "date", "url"] as const).find(
      (k) => nextErrors[k]
    );
    if (firstBad) {
      const ids = { number: "campana-numero", date: "campana-fecha", url: "campana-enlace" };
      requestAnimationFrame(() => {
        const el = document.getElementById(ids[firstBad]);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      });
      return;
    }

    setSaving(true);
    const failure = await onSave({
      campaign_number: parsedNumber,
      campaign_end_date: endDate || null,
      official_catalog_url: cleanUrl,
      sections_visible: { ...settings.sections_visible, campaign: visible },
    });
    setSaving(false);
    if (failure) {
      setError(failure);
      return;
    }
    if (cleanUrl) setUrl(cleanUrl);
    setSaved(true);
  }

  return (
    <SectionShell
      id="campana"
      title="Campaña"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <VisibilitySwitch
          id="campana-visible"
          checked={visible}
          onChange={setVisible}
        />

        <p className="text-ink-soft">
          Aparece una franja arriba de tu página con el número de campaña y
          hasta cuándo vale.
        </p>

        <div>
          <label htmlFor="campana-numero" className="field-label">
            Número de campaña
          </label>
          <input
            id="campana-numero"
            type="text"
            inputMode="numeric"
            maxLength={2}
            className="field-input"
            aria-invalid={Boolean(errors.number)}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Ejemplo: 10"
          />
          {errors.number && (
            <p role="alert" className="field-error">
              {errors.number}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="campana-fecha" className="field-label">
            La campaña cierra el día
          </label>
          <input
            id="campana-fecha"
            type="date"
            className="field-input"
            aria-invalid={Boolean(errors.date)}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.date && (
            <p role="alert" className="field-error">
              {errors.date}
            </p>
          )}
          <p className="text-ink-soft text-sm mt-1">
            Cuando pase esa fecha, tu página deja de mostrarla y pone un
            aviso suave. No tienes que hacer nada.
          </p>
        </div>

        <div>
          <label htmlFor="campana-enlace" className="field-label">
            Enlace al catálogo digital de Yanbal (opcional)
          </label>
          <input
            id="campana-enlace"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={LIMITS.url}
            className="field-input"
            aria-invalid={Boolean(errors.url)}
            aria-describedby="campana-enlace-ayuda"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega aquí el enlace"
          />
          {errors.url ? (
            <p id="campana-enlace-ayuda" role="alert" className="field-error">
              {errors.url}
            </p>
          ) : (
            <p id="campana-enlace-ayuda" className="text-ink-soft text-sm mt-1">
              Sale un botón &quot;Ver catálogo completo&quot; en tu página.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-sky p-4">
          <p className="text-ink-soft text-sm mb-1">Así se verá arriba:</p>
          <p className="font-semibold text-ink">
            {!visible
              ? "Nada: la sección está oculta."
              : preview.kind === "hidden"
              ? "Nada: falta el número o la fecha."
              : preview.text}
          </p>
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
