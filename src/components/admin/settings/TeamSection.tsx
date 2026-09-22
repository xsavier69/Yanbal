"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyError";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";
import type { Testimonial } from "@/lib/types";

const TEXT_MAX = 200;

/**
 * Historias del equipo. A diferencia de las otras secciones, cada historia se
 * guarda sola en cuanto ella toca "Agregar", porque es una lista y no un
 * formulario: así no puede perder lo que escribió al abrir otra sección.
 */
export default function TeamSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [list, setList] = useState<Testimonial[] | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [visible, setVisible] = useState(isSectionVisible(settings, "team"));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open || list !== null) return;
    let active = true;
    createClient()
      .from("testimonials")
      .select("*")
      .eq("type", "equipo")
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          setError(friendlyError(loadError, "abrir las historias"));
          setList([]);
          return;
        }
        setList((data ?? []) as Testimonial[]);
      });
    return () => {
      active = false;
    };
  }, [open, list]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAdded(false);

    if (name.trim().length < 2 || text.trim().length < 2) {
      setError("Escribe el nombre y la frase.");
      return;
    }

    setBusy(true);
    const { data, error: insertError } = await createClient()
      .from("testimonials")
      .insert({
        name: name.trim(),
        text: text.trim(),
        type: "equipo",
        time_selling: time.trim() || null,
      })
      .select()
      .single();
    setBusy(false);

    if (insertError) {
      setError(friendlyError(insertError, "guardar la historia"));
      return;
    }
    setList((prev) => [data as Testimonial, ...(prev ?? [])]);
    setName("");
    setText("");
    setTime("");
    setAdded(true);
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    const { error: deleteError } = await createClient()
      .from("testimonials")
      .delete()
      .eq("id", id);
    setBusy(false);
    if (deleteError) {
      setError(friendlyError(deleteError, "borrar la historia"));
      return;
    }
    setList((prev) => (prev ?? []).filter((t) => t.id !== id));
  }

  async function toggleVisible(next: boolean) {
    setVisible(next);
    const failure = await onSave({
      sections_visible: { ...settings.sections_visible, team: next },
    });
    if (failure) {
      setVisible(!next);
      setError(failure);
    }
  }

  const count = list?.length ?? 0;

  return (
    <SectionShell
      id="equipo"
      title="Historias de mi equipo"
      open={open}
      onToggle={onToggle}
      dirty={false}
    >
      <div className="flex flex-col gap-6">
        <VisibilitySwitch
          id="team-visible"
          checked={visible}
          onChange={toggleVisible}
        />

        <p className="text-ink-soft">
          Frases de consultoras que tú invitaste. Pídeles permiso antes de
          ponerlas. Se ven en tu página cuando haya al menos 2.
          {count > 0 && ` Ahora tienes ${count}.`}
        </p>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="toast-error">
              {error}
            </p>
          )}
          {added && !error && (
            <p className="toast-success">Historia guardada ✓</p>
          )}
        </div>

        <form onSubmit={add} className="flex flex-col gap-4">
          <div>
            <label htmlFor="team-name" className="field-label">
              Su nombre
            </label>
            <input
              id="team-name"
              type="text"
              maxLength={40}
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ejemplo: Rosa"
            />
          </div>

          <div>
            <label htmlFor="team-time" className="field-label">
              Cuánto tiempo lleva (opcional)
            </label>
            <input
              id="team-time"
              type="text"
              maxLength={40}
              className="field-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ejemplo: 2 años"
            />
          </div>

          <div>
            <label htmlFor="team-text" className="field-label">
              Lo que dice
            </label>
            <textarea
              id="team-text"
              className="field-input"
              style={{ minHeight: 100 }}
              maxLength={TEXT_MAX}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="field-hint">
              {text.length} / {TEXT_MAX} letras
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Guardando..." : "Agregar historia"}
          </button>
        </form>

        {list && list.length > 0 && (
          <ul className="flex flex-col gap-3 border-t border-line pt-5">
            {list.map((t) => (
              <li
                key={t.id}
                className="border border-line rounded-lg p-3 flex flex-col gap-2"
              >
                <p className="font-semibold text-ink">
                  {t.name}
                  {t.time_selling ? ` · ${t.time_selling}` : ""}
                </p>
                <p className="text-ink-soft">«{t.text}»</p>
                <button
                  type="button"
                  className="text-bad font-semibold min-h-[48px] text-left px-1"
                  disabled={busy}
                  onClick={() => remove(t.id)}
                >
                  Quitar esta historia
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}
