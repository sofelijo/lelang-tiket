// src/app/admin/konser/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/app/components/admin/ImageUpload";

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
    image: null as string | null,
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
          image: data.image || null,
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
    <div className="max-w-4xl mx-auto text-white space-y-6">
      <h2 className="text-2xl font-bold mb-4">Edit Konser</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom kiri: Upload Gambar */}
          <div>
            <ImageUpload
              onChange={(base64) => setForm((prev) => ({ ...prev, image: base64 }))}
              initialImage={form.image}
            />
          </div>

          {/* Kolom kanan: Form */}
          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div>
              <Label>Lokasi</Label>
              <Input
                type="text"
                required
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              />
            </div>
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-2 block">Kategori</Label>
              <div className="flex flex-col gap-2">
                {kategoriList.map((kategori) => (
                  <label key={kategori.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.kategoriIds.includes(kategori.id)}
                      onCheckedChange={() => toggleKategori(kategori.id)}
                    />
                    {kategori.nama}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
