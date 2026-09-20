import { buildGeneralWhatsAppLink } from "@/lib/utils";

export default function WhatsAppFloatingButton({
  whatsappNumber,
  welcomeMessage,
}: {
  whatsappNumber: string;
  welcomeMessage?: string | null;
}) {
  return (
    <a
      href={buildGeneralWhatsAppLink(whatsappNumber, welcomeMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center rounded-full shadow-lg"
      style={{ background: "#25d366", width: 60, height: 60 }}
      aria-label="Escribir por WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.32.65 4.49 1.78 6.34L4 29l7.82-1.72a11.96 11.96 0 0 0 4.2.76h.01c6.62 0 12.02-5.4 12.02-12.02C28.05 8.4 22.65 3 16.02 3zm0 21.86h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-4.63 1.02 1.03-4.51-.24-.37a9.84 9.84 0 0 1-1.5-5.38C5.26 9.5 10.05 4.7 16.02 4.7c2.83 0 5.5 1.1 7.5 3.11a10.53 10.53 0 0 1 3.1 7.5c0 5.98-4.8 10.77-10.6 10.55zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.37.18-1.51-.08-.13-.29-.21-.61-.37z" />
      </svg>
    </a>
  );
}
