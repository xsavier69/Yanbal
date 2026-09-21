const STEPS = [
  "Elige tus productos",
  "Escríbeme por WhatsApp",
  "Te los entrego o te los envío",
];

export default function HowToBuy({
  paymentMethods,
  deliveryInfo,
}: {
  paymentMethods: string | null;
  deliveryInfo: string | null;
}) {
  const payment = paymentMethods?.trim();
  const delivery = deliveryInfo?.trim();

  return (
    <section
      id="como-comprar"
      aria-labelledby="como-comprar-titulo"
      className="page-section"
    >
      <h2 id="como-comprar-titulo" className="section-title">
        Cómo comprar
      </h2>

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step}>
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {(payment || delivery) && (
        <div className="flex flex-col gap-1 mt-5 text-charcoal-soft">
          {payment && (
            <p>
              <strong className="text-charcoal">Formas de pago:</strong>{" "}
              {payment}
            </p>
          )}
          {delivery && (
            <p>
              <strong className="text-charcoal">Entregas:</strong> {delivery}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
