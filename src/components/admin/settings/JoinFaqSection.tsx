"use client";

import { useState, type FormEvent } from "react";
import { JOIN_FAQ } from "@/lib/joinFaq";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";

const MAX = 400;

export default function JoinFaqSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const saved0 = settings.join_faq ?? {};
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(JOIN_FAQ.map((q) => [q.key, saved0[q.key] ?? ""]))
  );
  const [visible, setVisible] = useState(isSectionVisible(settings, "joinFaq"));

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    visible !== isSectionVisible(settings, "joinFaq") ||
    JOIN_FAQ.some((q) => (answers[q.key] ?? "") !== (saved0[q.key] ?? ""));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setSaving(true);

    // Solo se guardan las respuestas escritas; las vacías no se muestran
    const clean = Object.fromEntries(
      Object.entries(answers)
        .map(([k, v]) => [k, v.trim()])
        .filter(([, v]) => v)
    );

    const failure = await onSave({
      join_faq: clean,
      sections_visible: { ...settings.sections_visible, joinFaq: visible },
    });
    setSaving(false);
    if (failure) {
      setError(failure);
      return;
    }
    setDone(true);
  }

  return (
    <SectionShell
      id="preguntas"
      title="Preguntas de la invitación"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <VisibilitySwitch
          id="faq-visible"
          checked={visible}
          onChange={setVisible}
        />

        <p className="text-ink-soft">
          Responde con tus palabras. La pregunta que dejes en blanco no
          aparece en tu página.
        </p>

        {JOIN_FAQ.map((item) => (
          <div key={item.key}>
            <label htmlFor={`faq-${item.key}`} className="field-label">
              {item.question}
            </label>
            <textarea
              id={`faq-${item.key}`}
              className="field-input"
              style={{ minHeight: 100 }}
              maxLength={MAX}
              value={answers[item.key] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [item.key]: e.target.value }))
              }
            />
            {item.key === "oficial" && (
              <p className="field-hint">
                Si la dejas vacía, tu página explica igual que eres consultora
                independiente y que el registro se hace en Yanbal. Esta
                pregunta siempre se muestra.
              </p>
            )}
          </div>
        ))}

        <SaveBar saving={saving} saved={done} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
