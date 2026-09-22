import type { Product, Settings, Testimonial } from "@/lib/types";

// Datos de ejemplo que solo se usan cuando Supabase no está configurado.

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();
const inDays = (n: number) =>
  new Date(Date.now() + n * DAY_MS).toISOString().slice(0, 10);

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
  campaign_number: 10,
  campaign_end_date: inDays(9),
  official_catalog_url: "https://www.yanbal.com",
  payment_methods: "Efectivo, transferencia, Deuna",
  delivery_info: "Entrega en Cuenca; envío a todo el Ecuador",
  sections_visible: {},
  // A propósito casi todo vacío: así se ve en la demostración qué falta llenar
  consultant_name: null,
  city: null,
  years_selling: null,
  hero_photo_url: null,
  signature_url: null,
  why_me_custom: null,
  kit_info: null,
  credit_available: false,
  benefits: null,
  benefits_source: null,
  official_join_url: null,
  closing_text: null,
  join_faq: {},
};

const base = {
  description: null,
  image_url: null,
  available: true,
  created_at: "2026-01-01T00:00:00Z",
};

// Fechas relativas a hoy, para que Novedades se vea en la demostración

export const DEMO_PRODUCTS: Product[] = [
  {
    ...base,
    id: "demo-1",
    created_at: daysAgo(3),
    name: "Perfume floral para dama",
    price: 32.5,
    offer_price: 27.9,
    category: "Fragancias",
    description: "Aroma fresco y suave para todos los días.",
  },
  {
    ...base,
    id: "demo-2",
    created_at: daysAgo(8),
    name: "Colonia para caballero",
    price: 28,
    offer_price: null,
    category: "Fragancias",
  },
  {
    ...base,
    id: "demo-3",
    created_at: daysAgo(15),
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

export const DEMO_TEAM: Testimonial[] = [
  {
    id: "equipo-1",
    name: "[NOMBRE]",
    text: "[FRASE REAL DE ELLA, CON SU PERMISO]",
    type: "equipo",
    time_selling: "[TIEMPO]",
    visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "equipo-2",
    name: "[NOMBRE]",
    text: "[FRASE REAL DE ELLA, CON SU PERMISO]",
    type: "equipo",
    time_selling: "[TIEMPO]",
    visible: true,
    created_at: "2026-01-02T00:00:00Z",
  },
];
