/**
 * Aviso por correo cuando llega una persona interesada.
 *
 * Es opcional: si no hay RESEND_API_KEY configurada, no pasa nada y el
 * registro se guarda igual. La tarjeta del panel siempre funciona.
 *
 * El correo NO lleva el teléfono ni datos de contacto: solo avisa que hay
 * alguien nuevo, para no pasear datos personales por el correo. El detalle
 * se ve dentro del panel, que está protegido.
 */
export async function notifyNewLead(lead: {
  name: string;
  city: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  const from = process.env.NOTIFY_FROM;
  if (!apiKey || !to || !from) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const where = lead.city ? ` (${lead.city})` : "";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nueva persona interesada: ${lead.name}${where}`,
        text: [
          `${lead.name}${where} dejó sus datos porque quiere saber cómo ser consultora.`,
          "",
          `Ábrelo en el panel: ${site}/mi-tienda/interesadas`,
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      console.error("No se pudo enviar el aviso por correo:", response.status);
    }
  } catch (error) {
    console.error("No se pudo enviar el aviso por correo:", error);
  }
}
