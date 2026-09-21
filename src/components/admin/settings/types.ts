import type { Settings } from "@/lib/types";

/** Los cambios que una sección quiere guardar. Devuelve el mensaje de error, o null si salió bien. */
export type SaveSettings = (
  patch: Partial<Omit<Settings, "id">>
) => Promise<string | null>;

export type SectionProps = {
  settings: Settings;
  open: boolean;
  onToggle: () => void;
  onSave: SaveSettings;
};
