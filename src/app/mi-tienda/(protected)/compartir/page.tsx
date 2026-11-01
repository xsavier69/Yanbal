import Link from "next/link";
import ShareLink from "@/components/admin/ShareLink";

export const metadata = { title: "Compartir mi página" };

export default function CompartirPage() {
  return (
    <div className="flex flex-col gap-6">
      <ShareLink />
      <Link href="/mi-tienda" className="btn-secondary">
        Volver a mis productos
      </Link>
    </div>
  );
}
