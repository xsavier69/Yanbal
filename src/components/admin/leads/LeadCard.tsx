"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/catalog/WhatsAppIcon";
import { buildLeadWhatsAppLink } from "@/lib/utils";
import { formatEcuadorMobile, timeAgo } from "@/lib/join";
import {
  AVAILABILITY_OPTIONS,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
} from "@/lib/types";

function availabilityLabel(value: Lead["availability"]) {
  return AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

export default function LeadCard({
  lead,
  consultantName,
  busy,
  onStatus,
  onDelete,
}: {
  lead: Lead;
  consultantName: string;
  busy: boolean;
  onStatus: (lead: Lead, status: LeadStatus) => void;
  onDelete: (lead: Lead) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const availability = availabilityLabel(lead.availability);

  return (
    <li className="lead-card" data-status={lead.status}>
      <p className="font-heading text-[22px] text-ink">{lead.name}</p>
      <p className="text-ink-soft">
        {[lead.city, timeAgo(lead.created_at)].filter(Boolean).join(" · ")}
      </p>
      {availability && <p className="text-ink-soft">{availability}</p>}
      <p className="text-ink-soft">{formatEcuadorMobile(lead.phone)}</p>
      {lead.contacted_at && (
        <p className="text-ink-soft text-[16px]">
          Le escribiste {timeAgo(lead.contacted_at)}
        </p>
      )}

      <a
        href={buildLeadWhatsAppLink(lead.phone, lead.name, consultantName)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp mt-4"
      >
        <WhatsAppIcon size={20} />
        Escribirle por WhatsApp
      </a>

      <p className="field-label mt-5" id={`estado-${lead.id}`}>
        ¿En qué va?
      </p>
      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-labelledby={`estado-${lead.id}`}
      >
        {LEAD_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className="status-btn"
            aria-pressed={lead.status === status}
            disabled={busy}
            onClick={() => onStatus(lead, status)}
          >
            {LEAD_STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-line">
        {!confirming ? (
          <button
            type="button"
            className="text-bad font-semibold min-h-[48px] px-1"
            onClick={() => setConfirming(true)}
          >
            Borrar esta persona
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">
              ¿Seguro que quieres borrar a {lead.name}? No se puede deshacer.
            </p>
            <button
              type="button"
              className="btn-danger"
              disabled={busy}
              onClick={() => onDelete(lead)}
            >
              Sí, borrar
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
