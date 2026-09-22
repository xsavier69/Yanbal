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
}: {
  id: string;
  label: string;
  help?: string;
  field: ReturnType<typeof usePhotoField>;
  shape?: "rect" | "round" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const box =
    shape === "round"
      ? "w-28 h-28 rounded-full"
      : shape === "wide"
      ? "w-full max-w-[230px] h-24 rounded-lg bg-white"
      : "w-40 h-52 rounded-lg";

  return (
    <div>
      <span className="field-label">{label}</span>
      {help && <p className="field-hint mb-2">{help}</p>}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={field.pick}
      />
      {field.preview && (
        <div
          className={`relative overflow-hidden border border-line mb-3 mx-auto ${box}`}
        >
          <Image
            src={field.preview}
            alt={label}
            fill
            sizes="230px"
            className={shape === "wide" ? "object-contain" : "object-cover"}
          />
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
