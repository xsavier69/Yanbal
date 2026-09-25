import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi tienda",
    short_name: "Mi tienda",
    description: "Administra tu catálogo Yanbal desde el celular.",
    start_url: "/mi-tienda",
    scope: "/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#1F4E8C",
    lang: "es-EC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
