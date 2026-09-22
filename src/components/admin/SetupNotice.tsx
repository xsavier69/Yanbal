import Link from "next/link";

export default function SetupNotice() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky px-5 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-line">
        <h1 className="font-heading text-2xl font-bold text-ink mb-3">
          Falta conectar la base de datos
        </h1>
        <p className="text-ink-soft text-lg mb-4">
          El panel necesita Supabase. Crea el archivo{" "}
          <code>.env.local</code> con las llaves del proyecto y reinicia la
          página. Los pasos están en el README.
        </p>
        <Link href="/" className="btn-primary">
          Ver la tienda
        </Link>
      </div>
    </div>
  );
}
