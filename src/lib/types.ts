export const CATEGORIES = [
  "Fragancias",
  "Maquillaje",
  "Cuidado facial",
  "Cuidado corporal",
  "Joyería",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  category: Category;
  description: string | null;
  image_url: string | null;
  available: boolean;
  created_at: string;
};

export type ProductInput = {
  name: string;
  price: number;
  offer_price: number | null;
  category: Category;
  description: string | null;
  image_url: string | null;
  available: boolean;
};

/** Secciones de la página que Amada puede mostrar u ocultar */
export type SectionKey =
  | "campaign"
  | "howto"
  | "news"
  | "offers"
  | "testimonials"
  | "faq"
  | "social"
  | "featured";

export type Settings = {
  id: number;
  whatsapp_number: string | null;
  store_name: string | null;
  welcome_message: string | null;
  about_text: string | null;
  about_photo_url: string | null;
  delivery_area: string | null;
  business_hours: string | null;
  campaign_number: number | null;
  campaign_end_date: string | null; // "YYYY-MM-DD"
  official_catalog_url: string | null;
  payment_methods: string | null;
  delivery_info: string | null;
  sections_visible: Partial<Record<SectionKey, boolean>> | null;
};
