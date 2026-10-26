import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Albert_Sans,
  Atkinson_Hyperlegible_Next,
} from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

// Titulares: serif elegante, de un solo peso, parecida a la que usa el
// catálogo de Yanbal. La jerarquía sale del tamaño, no de la negrita.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

// Texto de la invitación: grotesca geométrica, hermana de la del catálogo.
const albertSans = Albert_Sans({
  variable: "--font-albert",
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
  themeColor: "#F2683B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${instrumentSerif.variable} ${albertSans.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
