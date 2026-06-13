"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";

// Open Indonesian administrative-region dataset (provinsi → kota/kabupaten →
// kecamatan → kelurahan/desa). Static JSON, CORS-enabled.
const BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

type Region = { id: string; name: string };

export type IndonesiaAddressValue = {
  province: string;
  city: string;
  district: string;
  village: string;
  postal_code: string;
  line1: string;
};

const EMPTY: IndonesiaAddressValue = {
  province: "",
  city: "",
  district: "",
  village: "",
  postal_code: "",
  line1: "",
};

function RegionSelect({
  label,
  value,
  options,
  loading,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: Region[];
  loading: boolean;
  disabled?: boolean;
  placeholder: string;
  onChange: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <select
          required
          value={value}
          disabled={disabled || loading}
          onChange={(e) => {
            const name = e.target.selectedOptions[0]?.dataset.name ?? "";
            onChange(e.target.value, name);
          }}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id} data-name={o.name}>
              {o.name}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

export function IndonesiaAddress({
  onChange,
}: {
  onChange: (value: IndonesiaAddressValue) => void;
}) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [sel, setSel] = useState({ province: "", city: "", district: "", village: "" });
  const [names, setNames] = useState<IndonesiaAddressValue>(EMPTY);
  const [loading, setLoading] = useState({ prov: false, reg: false, dist: false, vil: false });

  // Bubble the named values up to the parent whenever anything changes.
  useEffect(() => onChange(names), [names, onChange]);

  // Load provinces once.
  useEffect(() => {
    setLoading((l) => ({ ...l, prov: true }));
    fetch(`${BASE}/provinces.json`)
      .then((r) => r.json())
      .then((d: Region[]) => setProvinces(d))
      .catch(() => setProvinces([]))
      .finally(() => setLoading((l) => ({ ...l, prov: false })));
  }, []);

  async function loadList(url: string, key: "reg" | "dist" | "vil") {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const res = await fetch(url);
      return (await res.json()) as Region[];
    } catch {
      return [];
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }

  async function onProvince(id: string, name: string) {
    setSel({ province: id, city: "", district: "", village: "" });
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setNames((n) => ({ ...n, province: name, city: "", district: "", village: "" }));
    if (id) setRegencies(await loadList(`${BASE}/regencies/${id}.json`, "reg"));
  }

  async function onCity(id: string, name: string) {
    setSel((s) => ({ ...s, city: id, district: "", village: "" }));
    setDistricts([]);
    setVillages([]);
    setNames((n) => ({ ...n, city: name, district: "", village: "" }));
    if (id) setDistricts(await loadList(`${BASE}/districts/${id}.json`, "dist"));
  }

  async function onDistrict(id: string, name: string) {
    setSel((s) => ({ ...s, district: id, village: "" }));
    setVillages([]);
    setNames((n) => ({ ...n, district: name, village: "" }));
    if (id) setVillages(await loadList(`${BASE}/villages/${id}.json`, "vil"));
  }

  function onVillage(id: string, name: string) {
    setSel((s) => ({ ...s, village: id }));
    setNames((n) => ({ ...n, village: name }));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <RegionSelect
          label="Provinsi"
          value={sel.province}
          options={provinces}
          loading={loading.prov}
          placeholder="Pilih provinsi"
          onChange={onProvince}
        />
        <RegionSelect
          label="Kota / Kabupaten"
          value={sel.city}
          options={regencies}
          loading={loading.reg}
          disabled={!sel.province}
          placeholder="Pilih kota/kabupaten"
          onChange={onCity}
        />
        <RegionSelect
          label="Kecamatan"
          value={sel.district}
          options={districts}
          loading={loading.dist}
          disabled={!sel.city}
          placeholder="Pilih kecamatan"
          onChange={onDistrict}
        />
        <RegionSelect
          label="Kelurahan / Desa"
          value={sel.village}
          options={villages}
          loading={loading.vil}
          disabled={!sel.district}
          placeholder="Pilih kelurahan/desa"
          onChange={onVillage}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="postal">Kode Pos</Label>
          <Input
            id="postal"
            required
            inputMode="numeric"
            maxLength={5}
            placeholder="cth. 12190"
            value={names.postal_code}
            onChange={(e) =>
              setNames((n) => ({ ...n, postal_code: e.target.value.replace(/\D/g, "") }))
            }
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="line1">Alamat Lengkap (Jalan, No., RT/RW)</Label>
          <Input
            id="line1"
            required
            placeholder="cth. Jl. Sudirman No. 1, RT 01/RW 02"
            value={names.line1}
            onChange={(e) => setNames((n) => ({ ...n, line1: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
