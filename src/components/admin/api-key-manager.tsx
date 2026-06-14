"use client";

import { useState, useTransition } from "react";
import { Copy, Check, KeyRound, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApiKey, revokeApiKey } from "@/lib/actions/api-keys";

export function CreateApiKey() {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function onCreate() {
    startTransition(async () => {
      const res = await createApiKey(name);
      setToken(res.token);
      setName("");
    });
  }

  function copy() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Nama key (cth. Integrasi ERP)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={onCreate} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Buat API Key
        </Button>
      </div>

      {token && (
        <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">
            Salin token ini sekarang — hanya ditampilkan satu kali.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-white px-3 py-2 font-mono text-xs">
              {token}
            </code>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin" : "Salin"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RevokeApiKey({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Cabut API key ini? Aplikasi yang memakainya akan langsung berhenti bekerja."))
          startTransition(() => revokeApiKey(id));
      }}
      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" /> {pending ? "…" : "Cabut"}
    </button>
  );
}

export function KeyIcon() {
  return <KeyRound className="h-5 w-5 text-brand-600" />;
}
