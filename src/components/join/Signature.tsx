import Image from "next/image";
import { PhotoPlaceholder } from "@/components/Pending";

/**
 * Su firma real. Es el único elemento con audacia de toda la página, y el
 * único sitio donde se usa el oro.
 *
 * Se revela de izquierda a derecha con una máscara, en vez de animar el
 * trazo: así funciona con cualquier archivo que ella entregue (PNG o SVG),
 * sin necesitar una vectorización especial. Ver el README.
 */
export default function Signature({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  return (
    <div>
      {url ? (
        <Image
          src={url}
          alt={`Firma de ${name}`}
          width={230}
          height={90}
          className="signature"
          style={{ width: "100%", maxWidth: 230, height: "auto" }}
          priority
        />
      ) : (
        <PhotoPlaceholder
          label="[FIRMA ESCANEADA]"
          className="h-20 max-w-[230px]"
        />
      )}
      <hr className="signature-rule" />
    </div>
  );
}
