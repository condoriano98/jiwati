"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWebhook, toggleWebhook, deleteWebhook } from "@/lib/actions/webhooks";

const TOPICS = [
  "order.created",
  "order.paid",
  "product.created",
  "product.updated",
  "product.deleted",
];

export function CreateWebhook() {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["order.paid"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleEvent(t: string) {
    setEvents((e) => (e.includes(t) ? e.filter((x) => x !== t) : [...e, t]));
  }

  function onCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createWebhook(url, events);
        setSecret(res.secret);
        setUrl("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal membuat webhook");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">URL Endpoint</label>
        <Input
          placeholder="https://contoh.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Event</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleEvent(t)}
              className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
                events.includes(t)
                  ? "bg-brand-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-brand-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={onCreate} disabled={pending || !url || events.length === 0}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Daftarkan Webhook
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {secret && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">
            Simpan signing secret ini — hanya ditampilkan sekali. Verifikasi header{" "}
            <code className="rounded bg-white px-1">X-Jiwati-Hmac-SHA256</code>.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-white px-3 py-2 font-mono text-xs">
              {secret}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WebhookActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-4">
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleWebhook(id, !active))}
        className="text-sm font-medium text-brand-700 hover:underline disabled:opacity-50"
      >
        {active ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Hapus webhook ini?")) startTransition(() => deleteWebhook(id));
        }}
        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" /> Hapus
      </button>
    </div>
  );
}
