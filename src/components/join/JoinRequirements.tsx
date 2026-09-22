import { Filled } from "@/components/Pending";
import { ph } from "@/lib/placeholder";
import { isSectionVisible } from "@/lib/sections";
import type { Settings } from "@/lib/types";

/**
 * Qué necesitas + Beneficios.
 *
 * Regla de honestidad: aquí no va ninguna cifra que ella no haya confirmado
 * en MAYA. Si no hay datos, la parte de beneficios no se muestra, y el aviso
 * de que los ingresos no están garantizados va siempre visible debajo.
 */
export default function JoinRequirements({
  settings,
}: {
  settings: Settings | null;
}) {
  const kit = ph(
    settings?.kit_info,
    "[PRECIO Y OPCIONES DEL KIT — confirmar en MAYA]"
  );
  const benefits = (settings?.benefits ?? "").trim();
  const source = (settings?.benefits_source ?? "").trim();
  const showBenefits = isSectionVisible(settings, "benefits");

  return (
    <section aria-labelledby="que-necesitas" className="page-section is-flush">
      <h2 id="que-necesitas" className="section-title">
        Qué necesitas
      </h2>
      <ul className="reason-list prose-measure">
        <li>Ser mayor de edad</li>
        <li>Tu cédula</li>
        <li>Un correo electrónico</li>
        <li>WhatsApp</li>
      </ul>

      <p className="mt-5 prose-measure">
        <strong>Kit de bienvenida:</strong> <Filled value={kit} />
      </p>
      {settings?.credit_available && (
        <p className="mt-2 text-ink-soft prose-measure">
          Yanbal puede darte crédito para tu kit, según su política.
        </p>
      )}

      {showBenefits && benefits && (
        <div className="mt-10">
          <h2 id="beneficios" className="section-title">
            Beneficios
          </h2>
          <div className="prose-measure whitespace-pre-line">{benefits}</div>
          {source && (
            <p className="mt-3 text-ink-soft text-[16px]">Fuente: {source}</p>
          )}
        </div>
      )}

      {/* Obligatorio y siempre visible: nunca dentro de un desplegable */}
      <p className="mt-6 p-4 rounded-lg border-2 border-line bg-sky prose-measure font-semibold">
        Lo que ganes depende de tus ventas y del tiempo que le dediques. No es
        un ingreso fijo ni garantizado.
      </p>
    </section>
  );
}
