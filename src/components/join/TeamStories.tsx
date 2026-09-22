import type { Testimonial } from "@/lib/types";

/** Historias reales de consultoras que ella incorporó. Se oculta con menos de 2. */
export default function TeamStories({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length < 2) return null;

  return (
    <section aria-labelledby="historias" className="page-section">
      <h2 id="historias" className="section-title">
        Historias de mi equipo
      </h2>
      <ul className="reason-list prose-measure">
        {testimonials.map((t) => (
          <li key={t.id}>
            <blockquote className="text-ink">«{t.text}»</blockquote>
            <p className="text-ink-soft text-[16px] mt-1">
              {t.name}
              {t.time_selling ? ` · ${t.time_selling}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
