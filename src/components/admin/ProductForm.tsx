"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/compressImage";
import { LIMITS, formatPrice, parsePriceInput } from "@/lib/utils";
import { friendlyError } from "@/lib/friendlyError";
import { checkPhotoFile, removeStoredImage } from "@/lib/storage";
import { CATEGORIES, type Category, type Product } from "@/lib/types";

type Props = {
  mode: "nuevo" | "editar";
  product?: Product;
};

type FieldErrors = {
  name?: string;
  price?: string;
  offer?: string;
  category?: string;
};

/** Valida un precio escrito por la usuaria. Devuelve el número o el mensaje de error. */
function checkPrice(
  text: string,
  emptyMessage: string
): { value: number } | { error: string } {
  if (!text.trim()) return { error: emptyMessage };
  const value = parsePriceInput(text);
  if (value === null) {
    return { error: "Escribe el precio solo con números. Ejemplo: 12,50" };
  }
  if (value <= 0) return { error: "El precio debe ser mayor que cero." };
  if (value > LIMITS.maxPrice) {
    return { error: "Revisa el precio: parece demasiado alto." };
  }
  return { value };
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    product?.image_url ?? null
  );
  const [compressing, setCompressing] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [priceText, setPriceText] = useState(
    product ? String(product.price).replace(".", ",") : ""
  );
  const [category, setCategory] = useState<Category | null>(
    product?.category ?? null
  );
  const [moreOpen, setMoreOpen] = useState(
    Boolean(product?.offer_price || product?.description)
  );
  const [offerPriceText, setOfferPriceText] = useState(
    product?.offer_price ? String(product.offer_price).replace(".", ",") : ""
  );
  const [description, setDescription] = useState(product?.description ?? "");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const photoProblem = checkPhotoFile(file);
    if (photoProblem) {
      setSaveError(photoProblem);
      return;
    }
    setSaveError(null);
    setCompressing(true);
    try {
      const compressed = await compressPhoto(file);
      setPhotoFile(compressed);
      setPhotoPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return URL.createObjectURL(compressed);
      });
    } catch {
      setSaveError("No se pudo procesar la foto. Intenta con otra.");
    } finally {
      setCompressing(false);
    }
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Falta el nombre del producto.";
    } else if (name.trim().length > LIMITS.productName) {
      nextErrors.name = `El nombre es muy largo (máximo ${LIMITS.productName} letras).`;
    }

    const price = checkPrice(priceText, "Falta el precio del producto.");
    if ("error" in price) nextErrors.price = price.error;

    if (offerPriceText.trim()) {
      const offer = checkPrice(offerPriceText, "");
      if ("error" in offer) {
        nextErrors.offer = offer.error;
      } else if (!("error" in price) && offer.value >= price.value) {
        nextErrors.offer = `El precio de oferta debe ser menor que el precio normal (${formatPrice(
          price.value
        )}).`;
      }
    }

    if (!category) {
      nextErrors.category = "Elige una categoría para el producto.";
    }
    setErrors(nextErrors);
    if (nextErrors.offer) setMoreOpen(true);

    // Lleva la vista al primer error para que no lo pase por alto
    const firstField = (
      [
        ["name", "nombre"],
        ["price", "precio"],
        ["category", "categoria"],
        ["offer", "precio-oferta"],
      ] as const
    ).find(([key]) => nextErrors[key]);
    if (firstField) {
      requestAnimationFrame(() => {
        const el = document.getElementById(firstField[1]);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
      });
    }
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);

    if (!validate()) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSaveError(friendlyError(null, "guardar el producto"));
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      let imageUrl = product?.image_url ?? null;

      if (photoFile) {
        const fileName = `${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, photoFile, {
            contentType: "image/jpeg",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const price = parsePriceInput(priceText)!;
      const offerPrice = offerPriceText.trim()
        ? parsePriceInput(offerPriceText)
        : null;
      const previousImageUrl = product?.image_url ?? null;

      const payload = {
        name: name.trim(),
        price,
        offer_price: offerPrice,
        category: category as Category,
        description: description.trim() || null,
        image_url: imageUrl,
      };

      if (mode === "nuevo") {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, available: true });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product!.id);
        if (error) throw error;
        // Si cambió la foto, borra la anterior para no acumular archivos
        if (photoFile && previousImageUrl && previousImageUrl !== imageUrl) {
          await removeStoredImage(supabase, previousImageUrl);
        }
      }

      setSaved(true);
      setTimeout(() => {
        router.push("/mi-tienda");
        router.refresh();
      }, 900);
    } catch (err) {
      setSaveError(friendlyError(err, "guardar el producto"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product!.id);
    setDeleting(false);

    if (error) {
      setDeleteError(friendlyError(error, "borrar el producto"));
      return;
    }

    await removeStoredImage(supabase, product!.image_url);
    router.push("/mi-tienda");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-charcoal">
        {mode === "nuevo" ? "Agregar producto" : "Editar producto"}
      </h1>

      {/* Foto */}
      <div>
        <span className="field-label">Foto</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handlePhotoChange}
          id="foto-producto"
        />
        {photoPreview && (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-border mb-3 bg-white">
            <Image
              src={photoPreview}
              alt="Foto del producto"
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
        )}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={compressing}
        >
          {compressing
            ? "Preparando la foto..."
            : photoPreview
            ? "Cambiar foto"
            : "Tomar foto o elegir de la galería"}
        </button>
      </div>

      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="field-label">
          Nombre del producto
        </label>
        <input
          id="nombre"
          type="text"
          maxLength={LIMITS.productName}
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ejemplo: Perfume Ella"
        />
        {errors.name && (
          <p role="alert" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label htmlFor="precio" className="field-label">
          Precio (dólares)
        </label>
        <input
          id="precio"
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(errors.price)}
          className="field-input"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          placeholder="Ejemplo: 12,50"
        />
        {errors.price && (
          <p role="alert" className="field-error">
            {errors.price}
          </p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <span className="field-label">Categoría</span>
        <div id="categoria" className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="category-card"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.category && (
          <p role="alert" className="field-error">
            {errors.category}
          </p>
        )}
      </div>

      {/* Más opciones */}
      <div className="border border-border rounded-2xl bg-white">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 text-lg font-semibold text-charcoal"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          Más opciones (no obligatorio)
          <span aria-hidden="true">{moreOpen ? "▲" : "▼"}</span>
        </button>
        {moreOpen && (
          <div className="px-4 pb-4 flex flex-col gap-5">
            <div>
              <label htmlFor="precio-oferta" className="field-label">
                Precio de oferta (opcional)
              </label>
              <input
                id="precio-oferta"
                type="text"
                inputMode="decimal"
                className="field-input"
                value={offerPriceText}
                onChange={(e) => setOfferPriceText(e.target.value)}
                aria-invalid={Boolean(errors.offer)}
                placeholder="Ejemplo: 9,99"
              />
              {errors.offer && (
                <p role="alert" className="field-error">
                  {errors.offer}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="descripcion" className="field-label">
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                maxLength={LIMITS.description}
                className="field-input"
                style={{ minHeight: 100 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe algo corto sobre el producto"
              />
            </div>
          </div>
        )}
      </div>

      {saveError && (
        <p role="alert" className="toast-error">
          {saveError}
        </p>
      )}
      {saved && <p className="toast-success">Producto guardado ✓</p>}

      <button type="submit" className="btn-primary" disabled={saving || saved}>
        {saving ? "Guardando..." : mode === "nuevo" ? "Guardar producto" : "Guardar cambios"}
      </button>

      {mode === "editar" && product && (
        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          {!confirmingDelete ? (
            <button
              type="button"
              className="btn-danger"
              onClick={() => setConfirmingDelete(true)}
            >
              Borrar producto
            </button>
          ) : (
            <div className="bg-white border-2 rounded-2xl p-4 flex flex-col gap-3" style={{ borderColor: "var(--color-danger)" }}>
              <p className="text-lg font-semibold text-charcoal">
                ¿Seguro que quieres borrar {product.name}? No se puede
                deshacer.
              </p>
              {deleteError && (
                <p role="alert" className="field-error">
                  {deleteError}
                </p>
              )}
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Borrando..." : "Sí, borrar producto"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
