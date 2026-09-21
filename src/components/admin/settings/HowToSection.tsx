"use client";

import { useState, type FormEvent } from "react";
import { LIMITS } from "@/lib/utils";
import { isSectionVisible } from "@/lib/sections";
import SectionShell from "@/components/admin/settings/SectionShell";
import SaveBar from "@/components/admin/settings/SaveBar";
import VisibilitySwitch from "@/components/admin/settings/VisibilitySwitch";
import type { SectionProps } from "@/components/admin/settings/types";

export default function HowToSection({
  settings,
  open,
  onToggle,
  onSave,
}: SectionProps) {
  const [visible, setVisible] = useState(isSectionVisible(settings, "howto"));
  const [payment, setPayment] = useState(settings.payment_methods ?? "");
  const [delivery, setDelivery] = useState(settings.delivery_info ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    visible !== isSectionVisible(settings, "howto") ||
    payment !== (settings.payment_methods ?? "") ||
    delivery !== (settings.delivery_info ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const failure = await onSave({
      payment_methods: payment.trim() || null,
      delivery_info: delivery.trim() || null,
      sections_visible: { ...settings.sections_visible, howto: visible },
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
      id="como-comprar"
      title="Cómo comprar"
      open={open}
      onToggle={onToggle}
      dirty={dirty}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <VisibilitySwitch
          id="howto-visible"
          checked={visible}
          onChange={setVisible}
        />

        <p className="text-charcoal-soft">
          Tu página muestra 3 pasos ya escritos: elegir los productos,
          escribirte por WhatsApp y recibirlos. Aquí solo completas dos
          líneas.
        </p>

        <div>
          <label htmlFor="formas-pago" className="field-label">
            Formas de pago (opcional)
          </label>
          <input
            id="formas-pago"
            type="text"
            maxLength={LIMITS.paymentMethods}
            className="field-input"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="Ejemplo: Efectivo, transferencia, Deuna"
          />
        </div>

        <div>
          <label htmlFor="entregas" className="field-label">
            Entregas (opcional)
          </label>
          <input
            id="entregas"
            type="text"
            maxLength={LIMITS.deliveryInfo}
            className="field-input"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            placeholder="Ejemplo: Entrego en Cuenca; envío a todo el Ecuador"
          />
        </div>

        <SaveBar saving={saving} saved={saved} error={error} dirty={dirty} />
      </form>
    </SectionShell>
  );
}
