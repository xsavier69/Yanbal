"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/compressImage";
import { checkPhotoFile, isSvgFile, removeStoredImage } from "@/lib/storage";

/**
 * Lógica compartida para los campos de foto del panel: elegir, comprobar,
 * comprimir, ver antes de guardar y subir. La foto solo se sube cuando ella
 * toca Guardar, nunca sola.
 *
 * `acceptSvg`: solo el campo de la firma lo activa. Un SVG no se comprime
 * (browser-image-compression trabaja con imágenes de trama, no con
 * vectores) y se sube tal cual, con su propio tipo de archivo.
 */
export function usePhotoField(
  initialUrl: string | null,
  prefix: string,
  { acceptSvg = false }: { acceptSvg?: boolean } = {}
) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    e.target.value = "";
    if (!chosen) return;
    const bad = checkPhotoFile(chosen, { acceptSvg });
    if (bad) {
      setProblem(bad);
      return;
    }
    setProblem(null);

    if (acceptSvg && isSvgFile(chosen)) {
      setFile(chosen);
      setPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(chosen);
      });
      return;
    }

    setBusy(true);
    try {
      const compressed = await compressPhoto(chosen);
      setFile(compressed);
      setPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(compressed);
      });
    } catch {
      setProblem("No se pudo procesar la foto. Intenta con otra.");
    } finally {
      setBusy(false);
    }
  }

  /** Sube el archivo elegido (si hay) y devuelve la dirección que se guarda */
  async function upload(): Promise<string | null> {
    if (!file) return initialUrl;
    const supabase = createClient();
    const svg = acceptSvg && isSvgFile(file);
    const fileName = `${prefix}-${crypto.randomUUID()}.${svg ? "svg" : "jpg"}`;
    const { error } = await supabase.storage.from("product-images").upload(
      fileName,
      file,
      { contentType: svg ? "image/svg+xml" : "image/jpeg", upsert: false }
    );
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(fileName).data
      .publicUrl;
  }

  /** Borra el archivo anterior cuando ya se guardó el nuevo */
  async function cleanUp(savedUrl: string | null) {
    if (file && initialUrl && initialUrl !== savedUrl) {
      await removeStoredImage(createClient(), initialUrl);
    }
    setFile(null);
  }

  return {
    file,
    preview,
    busy,
    problem,
    pick,
    upload,
    cleanUp,
    dirty: file !== null,
  };
}
