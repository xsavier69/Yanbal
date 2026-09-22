"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { normalizeEcuadorMobile } from "@/lib/join";
import { buildJoinWhatsAppLink, LIMITS } from "@/lib/utils";
import { AVAILABILITY_OPTIONS, type LeadSource } from "@/lib/types";

type Errors = { name?: string; phone?: string; consent?: string };

export default function LeadForm({
  consultantName,
  whatsappNumber,
  source,
}: {
  consultantName: string;
  whatsappNumber: string | null;
  source: LeadSource;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Dos trampas silenciosas para robots, sin molestar a nadie con un captcha:
  // un campo que sólo un programa llenaría, y el tiempo que tardó el envío.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const openedAt = useRef<number | null>(null);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFailure(null);

    const nextErrors: Errors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Escribe tu nombre.";
    }
    const cleanPhone = normalizeEcuadorMobile(phone);
    if (!phone.trim()) {
      nextErrors.phone = "Escribe tu número de WhatsApp.";
    } else if (!cleanPhone) {
      nextErrors.phone = "Escríbelo así: 0987654321";
    }
    if (!consent) {
      nextErrors.consent = "Marca la casilla para que pueda escribirte.";
    }
    setErrors(nextErrors);

    const firstBad = (["name", "phone", "consent"] as const).find(
      (k) => nextErrors[k]
    );
    if (firstBad) {
      const el = document.getElementById(`lead-${firstBad}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/interesadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          city: city.trim(),
          availability: availability || null,
          consent: true,
          source,
          website: honeypotRef.current?.value ?? "",
          elapsed: openedAt.current ? Date.now() - openedAt.current : 60000,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        setFailure(
          data?.message ??
            "No se pudo enviar. Revisa tu internet e inténtalo otra vez."
        );
        return;
      }
      setSent(true);
    } catch {
      setFailure(
        "No se pudo enviar. Revisa tu internet e inténtalo otra vez."
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="prose-measure flex flex-col gap-4" aria-live="polite">
        <p className="toast-success">
          Listo, {consultantName} te escribirá pronto.
        </p>
        {whatsappNumber && (
          <a
            href={buildJoinWhatsAppLink(whatsappNumber, consultantName, {
              name,
              city,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp max-w-sm"
          >
            <WhatsAppIcon size={20} />O escríbele ahora por WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="prose-measure flex flex-col gap-6">
      {/* Trampa para robots: invisible y fuera del recorrido del teclado */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="lead-website">No llenes este campo</label>
        <input
          ref={honeypotRef}
          id="lead-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="lead-name" className="field-label">
          Tu nombre
        </label>
        <input
          id="lead-name"
          type="text"
          autoComplete="given-name"
          maxLength={LIMITS.leadName}
          className="field-input"
          aria-invalid={Boolean(errors.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p role="alert" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="lead-phone" className="field-label">
          Tu WhatsApp
        </label>
        <input
          id="lead-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={LIMITS.whatsapp}
          className="field-input"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby="lead-phone-ayuda"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0987654321"
        />
        {errors.phone ? (
          <p id="lead-phone-ayuda" role="alert" className="field-error">
            {errors.phone}
          </p>
        ) : (
          <p id="lead-phone-ayuda" className="field-hint">
            Solo para escribirte. No aparece en ninguna parte de la página.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="lead-city" className="field-label">
          Tu ciudad o barrio{" "}
          <span className="font-normal text-ink-soft">(opcional)</span>
        </label>
        <input
          id="lead-city"
          type="text"
          autoComplete="address-level2"
          maxLength={LIMITS.leadCity}
          className="field-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="field-label">
          ¿Cuánto tiempo le dedicarías?{" "}
          <span className="font-normal text-ink-soft">(opcional)</span>
        </legend>
        <div className="flex flex-wrap gap-2 mt-1">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label key={option.value} className="chip cursor-pointer">
              <input
                type="radio"
                name="availability"
                value={option.value}
                className="sr-only"
                checked={availability === option.value}
                onChange={() => setAvailability(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="consent-row" htmlFor="lead-consent">
          <input
            id="lead-consent"
            type="checkbox"
            checked={consent}
            aria-invalid={Boolean(errors.consent)}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Acepto que {consultantName} me contacte por WhatsApp para contarme
            sobre Yanbal. Mis datos no se comparten con nadie más.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="field-error">
            {errors.consent}
          </p>
        )}
        <p className="field-hint">
          Puedes pedir que borremos tus datos cuando quieras.{" "}
          <a href="/privacidad">Cómo tratamos tus datos</a>
        </p>
      </div>

      <div aria-live="polite">
        {failure && (
          <p role="alert" className="toast-error mb-3">
            {failure}
          </p>
        )}
      </div>

      <button type="submit" className="btn-primary max-w-sm" disabled={sending}>
        {sending ? "Enviando..." : "Quiero saber más"}
      </button>
    </form>
  );
}
