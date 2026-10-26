import type { SupabaseClient } from "@supabase/supabase-js";
import { LIMITS } from "@/lib/utils";

const BUCKET = "product-images";

/**
 * Revisa que el archivo sea una foto de tamaño razonable. Devuelve el
 * mensaje de error o null. Un SVG se rechaza: no es una foto.
 */
export function checkPhotoFile(file: File): string | null {
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  if (isSvg) {
    return "Sube una foto (JPG, PNG o WebP), no un archivo SVG.";
  }
  if (!file.type.startsWith("image/")) {
    return "Ese archivo no es una foto. Elige una foto de tu galería o toma una nueva.";
  }
  if (file.size > LIMITS.photoMaxMB * 1024 * 1024) {
    return `El archivo es demasiado pesado (máximo ${LIMITS.photoMaxMB} MB). Elige otro.`;
  }
  return null;
}

/**
 * Borra del almacenamiento una foto que ya no se usa (al cambiarla o al
 * borrar el producto). Si falla no pasa nada: solo queda un archivo suelto.
 */
export async function removeStoredImage(
  supabase: SupabaseClient,
  publicUrl: string | null | undefined
) {
  if (!publicUrl) return;
  const marker = `/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(
    publicUrl.slice(index + marker.length).split("?")[0]
  );
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // se ignora a propósito
  }
}
