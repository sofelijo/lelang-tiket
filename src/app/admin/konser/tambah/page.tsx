"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import ImageCropUploader from "@/app/components/admin/ImageCropUploader";

interface Kategori {
  id: number;
  nama: string;
}

export default function TambahKonserPage() {
  const router = useRouter();
  const [konserId, setKonserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    tanggal: "",
    venue: "",
    kategoriIds: [] as number[],
    image: "" as string,
  });
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  useEffect(() => {
    fetch("/api/admin/kategori")
      .then((res) => res.json())
      .then((data) => setKategoriList(data));
  }, []);

  const toggleKategori = (id: number) => {
    setForm((prev) => ({
      ...prev,
      kategoriIds: prev.kategoriIds.includes(id)
        ? prev.kategoriIds.filter((kid) => kid !== id)
        : [...prev.kategoriIds, id],
    }));
  };

  const handleCreateKonser = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/konser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: null }),
    });

    const data = await res.json();
    if (res.ok) {
      setKonserId(data.konser.id); // setelah berhasil, aktifkan upload
    } else {
      alert("Gagal membuat konser");
    }
  };

  const handleAfterUpload = async (filename: string) => {
    if (!konserId) return;

    await fetch(`/api/admin/konser/${konserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: filename }),
    });

    router.push("/admin/konser");
  };

  return (
    <div className="max-w-4xl mx-auto text-white space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tambah Konser</h2>

      <form onSubmit={handleCreateKonser}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom kiri: Upload Gambar dengan crop */}
          <div>
            {konserId ? (
              <ImageCropUploader
                konserId={konserId}
                onSuccess={handleAfterUpload}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Simpan data konser dulu ya, baru bisa upload gambar 📷
              </p>
            )}

            {form.image && (
              <div className="aspect-[3/2] w-full mt-4 rounded overflow-hidden">
                <img
                  src={form.image}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Kolom kanan: Form Input */}
          <div className="space-y-4">
            {["nama", "lokasi", "tanggal", "venue"].map((field) => (
              <div key={field}>
                <Label className="capitalize">{field}</Label>
                <Input
                  type={field === "tanggal" ? "date" : "text"}
                  required={field !== "venue"}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            <div>
              <Label>Kategori untuk konser ini</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {kategoriList.map((kat) => (
                  <label key={kat.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={kat.id}
                      checked={form.kategoriIds.includes(kat.id)}
                      onChange={() => toggleKategori(kat.id)}
                    />
                    {kat.nama}
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 mt-4"
            >
              Simpan Konser
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
