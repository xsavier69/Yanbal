"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getCampaignState, todayInEcuador } from "@/lib/campaign";

// Vuelve a mirar la fecha cada minuto: si la campaña vence con la página
// abierta (o la página salió de una copia guardada), la banda cambia sola.
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

export default function CampaignBanner({
  number,
  endDate,
  todayFromServer,
}: {
  number: number | null;
  endDate: string | null;
  todayFromServer: string;
}) {
  const today = useSyncExternalStore(
    subscribe,
    () => todayInEcuador(),
    () => todayFromServer
  );
  const ref = useRef<HTMLDivElement>(null);
  const state = getCampaignState(number, endDate, today);
  const visible = state.kind !== "hidden";

  // Avisa a la barra de búsqueda cuánto mide la banda, para que se pegue
  // justo debajo y no queden una encima de la otra.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () =>
      root.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--banner-h");
    };
  }, [visible]);

  if (state.kind === "hidden") return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Campaña vigente"
      className="campaign-banner"
      data-state={state.kind}
    >
      <p>{state.text}</p>
    </div>
  );
}
