"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "oauth") {
      setError("Gagal masuk dengan Google. Silakan coba lagi.");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }
    router.push("/akun");
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success the browser is redirected to Google.
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Leaf className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">
        {mode === "login" ? "Masuk ke Akun" : "Buat Akun Baru"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "login"
          ? "Selamat datang kembali di Jiwati"
          : "Daftar untuk mulai belanja lebih mudah"}
      </p>

      <Card className="mt-6 w-full p-6">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-white text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          {mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "login" ? (
          <>Belum punya akun? <Link href="/daftar" className="font-semibold text-brand-700 hover:underline">Daftar</Link></>
        ) : (
          <>Sudah punya akun? <Link href="/masuk" className="font-semibold text-brand-700 hover:underline">Masuk</Link></>
        )}
      </p>
    </div>
  );
}
