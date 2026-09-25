"use client";

import { useRef } from "react";
import Image from "next/image";
import type { usePhotoField } from "@/components/admin/settings/usePhotoField";

export default function PhotoField({
  id,
  label,
  help,
  field,
  shape = "rect",
  acceptSvg = false,
}: {
  id: string;
  label: string;
  help?: string;
  field: ReturnType<typeof usePhotoField>;
  shape?: "rect" | "round" | "wide";
  acceptSvg?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const box =
    shape === "round"
      ? "w-28 h-28 rounded-full"
      : shape === "wide"
      ? "w-full max-w-[230px] h-24 rounded-sm bg-white"
      : "w-40 h-52 rounded-sm";

  return (
    <div>
      <span className="field-label">{label}</span>
      {help && <p className="field-hint mb-2">{help}</p>}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={acceptSvg ? "image/*,.svg" : "image/jpeg,image/png,image/webp"}
        className="sr-only"
        tabIndex={-1}
        onChange={field.pick}
      />
      {field.preview && (
        <div
          className={`relative overflow-hidden border border-line mb-3 mx-auto ${box}`}
        >
          {shape === "wide" ? (
            // La previsualización de la firma puede ser un SVG local
            // (blob:); next/image no optimiza SVGs remotos por diseño, y
            // aquí no hay nada que optimizar en un archivo tan pequeño.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={field.preview}
              alt={label}
              className="w-full h-full object-contain"
            />
          ) : (
            <Image
              src={field.preview}
              alt={label}
              fill
              sizes="230px"
              className="object-cover"
            />
          )}
        </div>
      )}
      {field.problem && (
        <p role="alert" className="field-error mb-2">
          {field.problem}
        </p>
      )}
      <button
        type="button"
        className="btn-secondary"
        disabled={field.busy}
        onClick={() => inputRef.current?.click()}
      >
        {field.busy
          ? "Preparando la foto..."
          : field.preview
          ? "Cambiar"
          : "Subir"}
      </button>
    </div>
  );
}
