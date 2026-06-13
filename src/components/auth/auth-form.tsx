"use client";

import { useState } from "react";
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
