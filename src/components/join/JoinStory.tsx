import { Filled } from "@/components/Pending";
import { ph } from "@/lib/placeholder";
import type { Settings } from "@/lib/types";

/** Qué hace una consultora · Por qué empezar conmigo · Cómo empiezas */
export default function JoinStory({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const custom = ph(
    settings?.why_me_custom,
    "[ALGO PROPIO DE ELLA: escríbelo con sus palabras]"
  );

  return (
    <>
      <section
        aria-labelledby="que-hace"
        className="band-sky border-y border-line"
      >
        <div className="page-section">
          <h2 id="que-hace" className="section-title">
            Qué hace una consultora
          </h2>
          <p className="prose-measure">
            Recomiendas productos a tus conocidas, pasas los pedidos por la app
            de Yanbal, los entregas y ganas por lo que vendes. Tú decides
            cuánto tiempo le dedicas.
          </p>
        </div>
      </section>

      <section aria-labelledby="por-que" className="page-section">
        <h2 id="por-que" className="section-title">
          Por qué empezar conmigo
        </h2>
        <ul className="reason-list prose-measure">
          <li>Te enseño a pasar tu primer pedido en la app, a tu lado.</li>
          <li>
            Te ayudo con tus primeras ventas y a armar tu lista de clientas.
          </li>
          <li>
            Me escribes cuando tengas dudas; te contesto yo, no un robot.
          </li>
          <li>
            <Filled value={custom} />
          </li>
        </ul>
      </section>

      <section aria-labelledby="como-empiezas" className="page-section is-flush">
        <h2 id="como-empiezas" className="section-title">
          Cómo empiezas
        </h2>
        <ol className="steps-stack prose-measure">
          <li>Me escribes o dejas tus datos aquí.</li>
          <li>
            Te llamo, te explico cómo funciona y resolvemos tus dudas.
          </li>
          <li>
            Te registras en Yanbal con tu nombre, cédula y correo.{" "}
            {consultantName} te acompaña en el proceso.
          </li>
          <li>Recibes tu kit de bienvenida y empiezas a vender.</li>
        </ol>
      </section>
    </>
  );
}
