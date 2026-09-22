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
  // catálogo (/productos)
  | "campaign"
  | "howto"
  | "news"
  | "offers"
  | "testimonials"
  // página de invitación (/)
  | "team"
  | "joinFaq"
  | "benefits";

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
  // Página de invitación
  consultant_name: string | null;
  city: string | null;
  years_selling: number | null;
  hero_photo_url: string | null;
  signature_url: string | null;
  why_me_custom: string | null;
  kit_info: string | null;
  credit_available: boolean | null;
  benefits: string | null;
  benefits_source: string | null;
  official_join_url: string | null;
  closing_text: string | null;
  join_faq: Record<string, string> | null;
};

export type TestimonialType = "clienta" | "equipo";

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  type: TestimonialType;
  time_selling: string | null;
  visible: boolean;
  created_at: string;
};

export const LEAD_STATUSES = [
  "nueva",
  "escrita",
  "unida",
  "no_interesa",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Cómo se llama cada estado en la pantalla de ella */
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  nueva: "Nueva",
  escrita: "Ya le escribí",
  unida: "Se unió",
  no_interesa: "No le interesa",
};

export const AVAILABILITY_OPTIONS = [
  { value: "horas", label: "Unas horas a la semana" },
  { value: "medio_tiempo", label: "Medio tiempo" },
  { value: "no_se", label: "Todavía no sé" },
] as const;
export type Availability = (typeof AVAILABILITY_OPTIONS)[number]["value"];

export const LEAD_SOURCES = [
  "whatsapp",
  "facebook",
  "volante",
  "directo",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  availability: Availability | null;
  status: LeadStatus;
  contacted_at: string | null;
  consent: boolean;
  source: LeadSource | null;
  created_at: string;
};
