import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AjustesPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return <SettingsForm initialSettings={settings} />;
}
