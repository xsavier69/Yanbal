import { JOIN_FAQ } from "@/lib/joinFaq";
import { safeHttpUrl } from "@/lib/campaign";
import type { Settings } from "@/lib/types";

/**
 * Acordeón nativo (<details>): funciona con teclado y lector de pantalla sin
 * JavaScript, y queda cerrado por defecto.
 *
 * "¿Es oficial de Yanbal?" siempre se muestra, con o sin respuesta guardada:
 * es la pregunta que protege a quien lee.
 */
export default function JoinFaqList({
  settings,
  consultantName,
}: {
  settings: Settings | null;
  consultantName: string;
}) {
  const answers = settings?.join_faq ?? {};
  const officialUrl = safeHttpUrl(settings?.official_join_url);

  const items = JOIN_FAQ.map((item) => ({
    ...item,
    answer: (answers[item.key] ?? "").trim(),
  })).filter((item) => item.answer || item.key === "oficial");

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="preguntas" className="page-section is-flush">
      <h2 id="preguntas" className="section-title">
        Preguntas frecuentes
      </h2>

      <div className="prose-measure">
        {items.map((item) => (
          <details key={item.key} className="faq-item">
            <summary className="faq-q">
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <div className="faq-a">
              {item.key === "oficial" ? (
                <>
                  <p>
                    {item.answer ||
                      `${consultantName} es consultora independiente de Yanbal. Tu registro se hace en el sistema oficial de Yanbal, no aquí: esta página es suya, no de la empresa.`}
                  </p>
                  {officialUrl && (
                    <p className="mt-2">
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Página oficial de Yanbal Ecuador
                      </a>
                    </p>
                  )}
                </>
              ) : (
                <p className="whitespace-pre-line">{item.answer}</p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
