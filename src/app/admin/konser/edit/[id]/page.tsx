// app/admin/konser/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditKonserPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    tanggal: "",
    venue: "",
  });

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/konser/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal ambil konser");
        const data = await res.json();
        setForm({
          nama: data.nama,
          lokasi: data.lokasi,
          tanggal: data.tanggal?.slice(0, 10) || "",
          venue: data.venue || "",
        });
      })
      .catch((err) => {
        console.error("❌ Error ambil data konser:", err);
        alert("Konser tidak ditemukan atau gagal diambil.");
        router.push("/admin/konser");
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/konser/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    router.push("/admin/konser");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Edit Konser</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["nama", "lokasi", "tanggal", "venue"].map((field) => (
          <div key={field}>
            <Label className="capitalize text-white">{field}</Label>
            <Input
              type={field === "tanggal" ? "date" : "text"}
              required
              value={form[field as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}
