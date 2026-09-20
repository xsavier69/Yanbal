import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Yanbal - Amada Ocaña",
  description:
    "Catálogo de productos Yanbal de Amada Ocaña, consultora independiente en Cuenca. Pide tus productos favoritos por WhatsApp.",
  openGraph: {
    title: "Yanbal - Amada Ocaña",
    description:
      "Catálogo de productos Yanbal de Amada Ocaña, consultora independiente en Cuenca. Pide tus productos favoritos por WhatsApp.",
    type: "website",
    locale: "es_EC",
  },
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
  themeColor: "#b5485d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
