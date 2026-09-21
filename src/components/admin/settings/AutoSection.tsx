"use client";

import { useState, type FormEvent } from "react";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";

/** Novedades y "En oferta" se llenan solos; aquí solo se pueden apagar. */
export default function AutoSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [news, setNews] = useState(isSectionVisible(settings, "news"));
  const [offers, setOffers] = useState(isSectionVisible(settings, "offers"));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    news !== isSectionVisible(settings, "news") ||
    offers !== isSectionVisible(settings, "offers");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const failure = await onSave({
      sections_visible: { ...settings.sections_visible, news, offers },
    });
    setSaving(false);
    if (failure) {
      setError(failure);
      return;
    }
    setSaved(true);
  }

  return (
    <SectionShell
      id="destacados"
      title="Novedades y ofertas"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-charcoal-soft">
          Estas dos franjas se llenan solas con tus productos. Solo se ven si
          hay al menos 2 productos para mostrar. Aquí puedes apagarlas.
        </p>

        <div className="flex flex-col gap-3">
          <p className="font-semibold text-charcoal">
            Novedades{" "}
            <span className="font-normal text-charcoal-soft">
              (productos que subiste en los últimos 30 días)
            </span>
          </p>
          <VisibilitySwitch id="news-visible" checked={news} onChange={setNews} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-semibold text-charcoal">
            En oferta{" "}
            <span className="font-normal text-charcoal-soft">
              (productos con precio de oferta)
            </span>
          </p>
          <VisibilitySwitch
            id="offers-visible"
            checked={offers}
            onChange={setOffers}
          />
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
