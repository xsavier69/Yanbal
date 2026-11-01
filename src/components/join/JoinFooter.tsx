import YanbalLogo from "@/components/YanbalLogo";
import YanbalIcon from "@/components/YanbalIcon";

export default function JoinFooter({
  consultantName,
  year,
  catalogUrl,
}: {
  consultantName: string;
  year: number;
  catalogUrl: string;
}) {
  return (
    <footer className="site-footer has-fab on-midnight">
      <div className="flex flex-col items-center gap-4 px-5">
        <span className="flex items-center gap-3">
          <YanbalIcon size={36} />
          <YanbalLogo height={18} />
        </span>
        <p className="badge-consultora">
          Página de consultora independiente Yanbal
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Ver mis productos
          </a>
        </nav>
        <p className="text-ink-soft text-[16px]">
          © {year} {consultantName}
        </p>
      </div>
    </footer>
  );
}
