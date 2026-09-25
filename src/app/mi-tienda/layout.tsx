import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MiTiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Todo lo que vive bajo /mi-tienda usa Atkinson Hyperlegible Next, sin
  // importar la ruta (incluye el login): es la única regla de tipografía
  // que se sobrescribe por zona.
  return <div className="panel-scope">{children}</div>;
}
