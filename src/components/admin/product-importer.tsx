"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { Upload, FileDown, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { importProducts, type ImportRow, type ImportResult } from "@/lib/actions/admin";

const TEMPLATE_HEADERS = [
  "name",
  "price",
  "compare_at_price",
  "stock",
  "sku",
  "brand",
  "category",
  "description",
  "image",
  "is_bestseller",
];

const SAMPLE_CSV = `name,price,compare_at_price,stock,sku,brand,category,description,image,is_bestseller
Vitamin D3 1000 IU 60 Softgel,98000,120000,150,VD3-60,VitaForce,Vitamin & Imun,Vitamin D3 untuk kesehatan tulang dan imun,https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=70,true
Probiotik 30 Kapsul,159000,,80,PRO-30,Herbalia,Herbal & Alami,Probiotik untuk kesehatan pencernaan,https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=70,false`;

type ParsedRow = ImportRow & Record<string, unknown>;

export function ProductImporter() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    setParseError(null);
    setResult(null);
    setFileName(file.name);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => {
        if (res.errors.length) {
          setParseError(res.errors[0].message);
          return;
        }
        if (!res.meta.fields?.includes("name") || !res.meta.fields?.includes("price")) {
          setParseError("CSV harus memiliki kolom minimal: name, price");
          return;
        }
        setRows(res.data.filter((r) => r.name));
      },
    });
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-produk.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function runImport() {
    setResult(null);
    startTransition(async () => {
      const res = await importProducts(rows);
      setResult(res);
    });
  }

  return (
    <div className="space-y-6">
      {/* Step 1: template + upload */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">1. Siapkan File CSV</h2>
            <p className="text-sm text-muted-foreground">
              Kolom: {TEMPLATE_HEADERS.join(", ")}
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <FileDown className="h-4 w-4" /> Unduh Template
          </Button>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50">
          <Upload className="h-8 w-8 text-brand-500" />
          <span className="mt-2 text-sm font-medium">
            {fileName ?? "Klik untuk pilih file CSV"}
          </span>
          <span className="text-xs text-muted-foreground">atau seret file ke sini</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>

        {parseError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" /> {parseError}
          </p>
        )}
      </Card>

      {/* Step 2: preview */}
      {rows.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">2. Pratinjau ({rows.length} produk)</h2>
            <Button onClick={runImport} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengimpor…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Impor {rows.length} Produk
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Nama</th>
                  <th className="px-3 py-2 font-medium">Harga</th>
                  <th className="px-3 py-2 font-medium">Stok</th>
                  <th className="px-3 py-2 font-medium">Brand</th>
                  <th className="px-3 py-2 font-medium">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 100).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{String(r.price ?? "")}</td>
                    <td className="px-3 py-2">{String(r.stock ?? 0)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.brand || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.category || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 100 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Menampilkan 100 baris pertama. Semua {rows.length} baris akan diimpor.
            </p>
          )}
        </Card>
      )}

      {/* Step 3: result */}
      {result && (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-5 w-5 text-brand-500" /> Hasil Impor
          </h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="rounded-lg bg-green-100 px-3 py-1.5 font-medium text-green-700">
              {result.inserted} ditambahkan
            </span>
            <span className="rounded-lg bg-brand-100 px-3 py-1.5 font-medium text-brand-700">
              {result.updated} diperbarui
            </span>
            {result.errors.length > 0 && (
              <span className="rounded-lg bg-red-100 px-3 py-1.5 font-medium text-red-700">
                {result.errors.length} gagal
              </span>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 space-y-1 text-sm text-red-600">
              {result.errors.map((e, i) => (
                <p key={i}>Baris {e.row}: {e.message}</p>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
