import type { Metadata, Viewport } from "next";
import { Newsreader, Instrument_Sans, Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

// Titulares: eje óptico variable, para que el propio tamaño del texto
// decida cuánto "display" se ve la letra (grande y editorial vs. pequeña
// y legible), en vez de una sola talla para todo.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
});

// Texto e interfaz de la invitación y el catálogo.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "swap",
});

// Panel /mi-tienda: se mantiene, es la que mejor se lee para ella.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi tienda",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14213D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${instrumentSans.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
