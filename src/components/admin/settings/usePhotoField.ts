"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/compressImage";
import { checkPhotoFile, removeStoredImage } from "@/lib/storage";

/**
 * Lógica compartida para los campos de foto del panel: elegir, comprobar,
 * comprimir, ver antes de guardar y subir. La foto solo se sube cuando ella
 * toca Guardar, nunca sola.
 */
export function usePhotoField(initialUrl: string | null, prefix: string) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    e.target.value = "";
    if (!chosen) return;
    const bad = checkPhotoFile(chosen);
    if (bad) {
      setProblem(bad);
      return;
    }
    setProblem(null);
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

  /** Sube la foto elegida (si hay) y devuelve la dirección que se guarda */
  async function upload(): Promise<string | null> {
    if (!file) return initialUrl;
    const supabase = createClient();
    const fileName = `${prefix}-${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(fileName).data
      .publicUrl;
  }

  /** Borra la foto anterior cuando ya se guardó la nueva */
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
