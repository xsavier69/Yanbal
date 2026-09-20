import type { Product, Settings } from "@/lib/types";

// Datos de ejemplo que solo se usan cuando Supabase no está configurado.

export const DEMO_SETTINGS: Settings = {
  id: 1,
  whatsapp_number: "593999999999",
  store_name: "Tienda de Amada",
  welcome_message: "Hola Amada, me gustaría hacer un pedido.",
  about_text:
    "Soy Amada, consultora independiente. Con gusto te ayudo a encontrar el producto perfecto. (Texto de ejemplo)",
  about_photo_url: null,
  delivery_area: "Ocaña y alrededores",
  business_hours: "Lunes a sábado, 9:00 a 18:00",
};

const base = {
  description: null,
  image_url: null,
  available: true,
  created_at: "2026-01-01T00:00:00Z",
};

export const DEMO_PRODUCTS: Product[] = [
  {
    ...base,
    id: "demo-1",
    name: "Perfume floral para dama",
    price: 32.5,
    offer_price: 27.9,
    category: "Fragancias",
    description: "Aroma fresco y suave para todos los días.",
  },
  {
    ...base,
    id: "demo-2",
    name: "Colonia para caballero",
    price: 28,
    offer_price: null,
    category: "Fragancias",
  },
  {
    ...base,
    id: "demo-3",
    name: "Labial de larga duración",
    price: 9.9,
    offer_price: null,
    category: "Maquillaje",
  },
  {
    ...base,
    id: "demo-4",
    name: "Crema facial hidratante",
    price: 18.75,
    offer_price: 15,
    category: "Cuidado facial",
  },
  {
    ...base,
    id: "demo-5",
    name: "Loción corporal de almendras",
    price: 12.4,
    offer_price: null,
    category: "Cuidado corporal",
  },
  {
    ...base,
    id: "demo-6",
    name: "Aretes dorados",
    price: 14,
    offer_price: null,
    category: "Joyería",
    available: false,
  },
];
