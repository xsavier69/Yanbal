"use client";

import { useState, type FormEvent } from "react";
import { safeHttpUrl } from "@/lib/campaign";
import { LIMITS } from "@/lib/utils";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";

export default function StartSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [kit, setKit] = useState(settings.kit_info ?? "");
  const [credit, setCredit] = useState(Boolean(settings.credit_available));
  const [benefits, setBenefits] = useState(settings.benefits ?? "");
  const [source, setSource] = useState(settings.benefits_source ?? "");
  const [url, setUrl] = useState(settings.official_join_url ?? "");
  const [showBenefits, setShowBenefits] = useState(
    isSectionVisible(settings, "benefits")
  );

  const [urlError, setUrlError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    kit !== (settings.kit_info ?? "") ||
    credit !== Boolean(settings.credit_available) ||
    benefits !== (settings.benefits ?? "") ||
    source !== (settings.benefits_source ?? "") ||
    url !== (settings.official_join_url ?? "") ||
    showBenefits !== isSectionVisible(settings, "benefits");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setUrlError(null);
    setSourceError(null);

    let cleanUrl: string | null = null;
    if (url.trim()) {
      cleanUrl = safeHttpUrl(url);
      if (!cleanUrl) {
        setUrlError("Ese enlace no parece correcto. Cópialo desde tu navegador.");
        document.getElementById("start-url")?.focus();
        return;
      }
    }

    // Una cifra sin fuente no se publica: es la regla de honestidad.
    if (benefits.trim() && !source.trim() && /\d/.test(benefits)) {
      setSourceError(
        "Escribiste números. Pon de dónde salen, por ejemplo: Yanbal Ecuador, campaña 10."
      );
      document.getElementById("start-source")?.focus();
      return;
    }

    setSaving(true);
    const failure = await onSave({
      kit_info: kit.trim() || null,
      credit_available: credit,
      benefits: benefits.trim() || null,
      benefits_source: source.trim() || null,
      official_join_url: cleanUrl,
      sections_visible: {
        ...settings.sections_visible,
        benefits: showBenefits,
      },
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
      id="empezar"
      title="Empezar en Yanbal"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-ink-soft">
          Pon aquí solo lo que tu directora te confirme. Si un dato queda
          vacío, tu página no lo muestra; nunca se inventa nada.
        </p>

        <div>
          <label htmlFor="start-kit" className="field-label">
            Kit de bienvenida
          </label>
          <textarea
            id="start-kit"
            className="field-input"
            style={{ minHeight: 90 }}
            maxLength={300}
            value={kit}
            onChange={(e) => setKit(e.target.value)}
            placeholder="Ejemplo: Hay dos kits, uno de $XX y otro de $XX."
          />
        </div>

        <label className="consent-row" htmlFor="start-credit">
          <input
            id="start-credit"
            type="checkbox"
            checked={credit}
            onChange={(e) => setCredit(e.target.checked)}
          />
          <span>
            Yanbal da crédito para el kit.
            <span className="block text-ink-soft text-[16px]">
              Solo márcalo si tu directora te lo confirmó.
            </span>
          </span>
        </label>

        <div className="border-t border-line pt-6 flex flex-col gap-4">
          <p className="font-semibold text-ink">Beneficios</p>
          <VisibilitySwitch
            id="benefits-visible"
            checked={showBenefits}
            onChange={setShowBenefits}
          />

          <div>
            <label htmlFor="start-benefits" className="field-label">
              Qué ofrece Yanbal
            </label>
            <textarea
              id="start-benefits"
              className="field-input"
              style={{ minHeight: 130 }}
              maxLength={600}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder={"Ejemplo:\nGanas un XX% de lo que vendes.\nPremios por campaña.\nCapacitaciones gratis."}
            />
            <p className="field-hint">
              Una idea por línea. {benefits.length} / 600 letras.
            </p>
          </div>

          <div>
            <label htmlFor="start-source" className="field-label">
              ¿De dónde salen estos datos?
            </label>
            <input
              id="start-source"
              type="text"
              maxLength={120}
              className="field-input"
              aria-invalid={Boolean(sourceError)}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ejemplo: Yanbal Ecuador, campaña 10"
            />
            {sourceError ? (
              <p role="alert" className="field-error">
                {sourceError}
              </p>
            ) : (
              <p className="field-hint">
                Aparece debajo, en letra pequeña, para que se vea que no son
                cifras inventadas.
              </p>
            )}
          </div>

          <p className="p-4 rounded-lg bg-sky border-2 border-line">
            Tu página siempre muestra este aviso, aunque dejes todo vacío:
            &quot;Lo que ganes depende de tus ventas y del tiempo que le
            dediques. No es un ingreso fijo ni garantizado.&quot;
          </p>
        </div>

        <div className="border-t border-line pt-6">
          <label htmlFor="start-url" className="field-label">
            Enlace oficial de Yanbal para emprender
          </label>
          <input
            id="start-url"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={LIMITS.url}
            className="field-input"
            aria-invalid={Boolean(urlError)}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega aquí el enlace"
          />
          {urlError ? (
            <p role="alert" className="field-error">
              {urlError}
            </p>
          ) : (
            <p className="field-hint">
              Va en la pregunta &quot;¿Es oficial de Yanbal?&quot;, para que
              quien lea pueda comprobarlo.
            </p>
          )}
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
