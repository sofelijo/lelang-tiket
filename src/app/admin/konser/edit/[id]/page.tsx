"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditKonserPage() {
  const params = useParams();
  const router = useRouter();

  const konserId = typeof params?.id === "string" ? parseInt(params.id) : null;

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    tanggal: "",
    venue: "",
    kategoriIds: [] as number[],
  });

  const [kategoriList, setKategoriList] = useState<{ id: number; nama: string }[]>([]);

  useEffect(() => {
    if (!konserId) return;

    fetch(`/api/admin/konser/${konserId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          nama: data.nama,
          lokasi: data.lokasi,
          tanggal: data.tanggal.slice(0, 10),
          venue: data.venue || "",
          kategoriIds: data.konserKategori.map((k: any) => k.kategoriId),
        });
      });

    fetch("/api/admin/kategori")
      .then((res) => res.json())
      .then(setKategoriList);
  }, [konserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/konser/${konserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/konser");
  };

  const toggleKategori = (kategoriId: number) => {
    setForm((prev) => ({
      ...prev,
      kategoriIds: prev.kategoriIds.includes(kategoriId)
        ? prev.kategoriIds.filter((id) => id !== kategoriId)
        : [...prev.kategoriIds, kategoriId],
    }));
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Edit Konser</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-white">Nama</Label>
          <Input
            type="text"
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-white">Lokasi</Label>
          <Input
            type="text"
            required
            value={form.lokasi}
            onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-white">Tanggal</Label>
          <Input
            type="date"
            required
            value={form.tanggal}
            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-white">Venue</Label>
          <Input
            type="text"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Kategori</Label>
          <div className="flex flex-col gap-2">
            {kategoriList.map((kategori) => (
              <label key={kategori.id} className="flex items-center gap-2 text-white">
                <Checkbox
                  checked={form.kategoriIds.includes(kategori.id)}
                  onCheckedChange={() => toggleKategori(kategori.id)}
                />
                {kategori.nama}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}
