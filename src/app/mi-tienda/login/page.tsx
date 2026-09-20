"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      if (signInError.status === 429) {
        setError("Hiciste muchos intentos. Espera unos minutos y vuelve a probar.");
      } else if (signInError.status === 400) {
        setError("El correo o la contraseña no son correctos. Revísalos e inténtalo otra vez.");
      } else {
        setError("No se pudo entrar. Revisa tu internet e inténtalo otra vez.");
      }
      return;
    }

    router.replace("/mi-tienda");
    router.refresh();
  }

  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
            Mi tienda
          </h1>
          <p className="text-charcoal-soft text-lg">
            Entra para administrar tus productos
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col gap-5"
        >
          <div>
            <label htmlFor="email" className="field-label">
              Tu correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Tu contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
