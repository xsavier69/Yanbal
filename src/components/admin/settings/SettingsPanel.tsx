"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyError";
import InfoSection from "@/components/admin/settings/InfoSection";
import CampaignSection from "@/components/admin/settings/CampaignSection";
import HowToSection from "@/components/admin/settings/HowToSection";
import AutoSection from "@/components/admin/settings/AutoSection";
import type { SaveSettings } from "@/components/admin/settings/types";
import type { Settings } from "@/lib/types";

const EMPTY_SETTINGS: Settings = {
  id: 1,
  whatsapp_number: null,
  store_name: null,
  welcome_message: null,
  about_text: null,
  about_photo_url: null,
  delivery_area: null,
  business_hours: null,
  campaign_number: null,
  campaign_end_date: null,
  official_catalog_url: null,
  payment_methods: null,
  delivery_info: null,
  sections_visible: {},
};

export default function SettingsPanel({
  initialSettings,
}: {
  initialSettings: Settings | null;
}) {
  const [settings, setSettings] = useState<Settings>({
    ...EMPTY_SETTINGS,
    ...initialSettings,
    sections_visible: initialSettings?.sections_visible ?? {},
  });
  // Una sola sección abierta a la vez; todas empiezan cerradas
  const [openId, setOpenId] = useState<string | null>(null);

  const save: SaveSettings = async (patch) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return friendlyError(null, "guardar los cambios");
    }
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("settings")
        .upsert({ id: 1, ...patch });
      if (error) return friendlyError(error, "guardar los cambios");
      setSettings((previous) => ({ ...previous, ...patch }));
      return null;
    } catch (err) {
      return friendlyError(err, "guardar los cambios");
    }
  };

  function toggle(id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next) {
      // Lleva la sección abierta al inicio de la pantalla
      requestAnimationFrame(() =>
        document
          .getElementById(`${next}-boton`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }

  const common = (id: string) => ({
    settings,
    open: openId === id,
    onToggle: () => toggle(id),
    onSave: save,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">
          Ajustes de mi página
        </h1>
        <p className="text-charcoal-soft mt-1">
          Toca una sección para abrirla. Cada una tiene su propio botón para
          guardar.
        </p>
      </div>

      <InfoSection {...common("info")} />
      <CampaignSection {...common("campana")} />
      <HowToSection {...common("como-comprar")} />
      <AutoSection {...common("destacados")} />
    </div>
  );
}
