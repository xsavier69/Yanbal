"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyError";
import LeadCard from "@/components/admin/leads/LeadCard";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
} from "@/lib/types";

type Filter = LeadStatus | "todas";

export default function LeadsPanel({
  initialLeads,
  consultantName,
}: {
  initialLeads: Lead[];
  consultantName: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<Filter>("todas");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const thisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const ofMonth = leads.filter(
      (l) => new Date(l.created_at).getTime() >= start
    );
    return {
      total: ofMonth.length,
      joined: ofMonth.filter((l) => l.status === "unida").length,
    };
  }, [leads]);

  const visible = useMemo(() => {
    // "No le interesa" se esconde salvo que ella lo pida
    if (filter === "todas") {
      return leads.filter((l) => l.status !== "no_interesa");
    }
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  async function changeStatus(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;
    setBusyId(lead.id);
    setError(null);

    // La fecha se guarda la primera vez que marca "Ya le escribí"
    const contactedAt =
      status === "escrita" && !lead.contacted_at
        ? new Date().toISOString()
        : lead.contacted_at;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status, contacted_at: contactedAt })
      .eq("id", lead.id);
    setBusyId(null);

    if (updateError) {
      setError(friendlyError(updateError, "cambiar el estado"));
      return;
    }
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id ? { ...l, status, contacted_at: contactedAt } : l
      )
    );
  }

  async function remove(lead: Lead) {
    setBusyId(lead.id);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id);
    setBusyId(null);

    if (deleteError) {
      setError(friendlyError(deleteError, "borrar esta persona"));
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "todas", label: "Todas" },
    ...LEAD_STATUSES.map((s) => ({
      value: s as Filter,
      label: LEAD_STATUS_LABEL[s],
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl text-ink">Personas interesadas</h1>
        <p className="text-ink-soft mt-1">
          Este mes: {thisMonth.total}{" "}
          {thisMonth.total === 1 ? "interesada" : "interesadas"},{" "}
          {thisMonth.joined} se {thisMonth.joined === 1 ? "unió" : "unieron"}.
        </p>
      </div>

      {error && (
        <p role="alert" className="toast-error">
          {error}
        </p>
      )}

      <div className="chip-row" role="group" aria-label="Filtrar por estado">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className="chip"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-line p-6 text-center">
          <p className="text-ink-soft text-lg">
            {leads.length === 0
              ? "Todavía nadie ha dejado sus datos. Comparte tu página para que te conozcan."
              : "No hay personas en este grupo."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              consultantName={consultantName}
              busy={busyId === lead.id}
              onStatus={changeStatus}
              onDelete={remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
