import imageCompression from "browser-image-compression";

/**
 * Comprime una foto tomada con el celular antes de subirla:
 * máximo ~1200px de lado y apunta a ~300 KB, para que suba rápido
 * incluso con internet lenta.
 */
export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.3,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.8,
  });
}
