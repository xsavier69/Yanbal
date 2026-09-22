import Link from "next/link";

export default function JoinFooter({
  consultantName,
  year,
}: {
  consultantName: string;
  year: number;
}) {
  return (
    <footer className="page-section text-center flex flex-col items-center gap-3">
      <p className="badge-consultora">
        Página de consultora independiente Yanbal
      </p>
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/productos" className="footer-link">
          Ver mis productos
        </Link>
        <Link href="/privacidad" className="footer-link">
          Cómo trato tus datos
        </Link>
      </nav>
      <p className="text-ink-soft text-[16px]">
        © {year} {consultantName}
      </p>
    </footer>
  );
}
