import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import SettingsPanel from "@/components/admin/settings/SettingsPanel";

export default async function AjustesPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return <SettingsPanel initialSettings={settings} />;
}
