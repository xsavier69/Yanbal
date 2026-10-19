import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Evita que Next tome un package-lock.json de una carpeta superior
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        // La tienda propia está en pausa: todo lo de "productos" es el
        // catálogo oficial de Yanbal. Es temporal (307) para poder
        // reactivar /productos más adelante sin que los navegadores
        // se acuerden de la redirección.
        source: "/productos",
        destination: "/catalogo-yanbal.pdf",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // El service worker nunca debe quedarse viejo en caché
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        // El panel no se guarda en cachés compartidas ni del navegador
        source: "/mi-tienda/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
