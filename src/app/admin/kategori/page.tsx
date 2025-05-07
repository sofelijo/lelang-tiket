"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Kategori {
  id: number;
  nama: string;
}

export default function KelolaKategoriPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kategori");
    const data = await res.json();
    setKategoriList(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/kategori", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama }),
    });

    if (res.ok) {
      setNama("");
      fetchKategori(); // Refresh list
    } else {
      alert("Gagal menambah kategori");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-white">Kelola Kategori</h2>

      {/* Form Tambah Kategori */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-white">Nama Kategori</Label>
          <Input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: VIP, Festival, Reguler"
            required
          />
        </div>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          + Tambah Kategori
        </Button>
      </form>

      <hr className="border-gray-700" />

      {/* List Kategori */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-white">Memuat data...</p>
        ) : kategoriList.length === 0 ? (
          <p className="text-gray-400">Belum ada kategori.</p>
        ) : (
          kategoriList.map((kategori) => (
            <div
              key={kategori.id}
              className="bg-gray-800 text-white p-3 rounded-md border border-gray-700"
            >
              {kategori.nama}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
