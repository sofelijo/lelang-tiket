// app/admin/konser/tambah/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TambahKonserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    tanggal: "",
    venue: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/konser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/konser");
    } else {
      alert("Gagal tambah konser!");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-white">Tambah Konser</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["nama", "lokasi", "tanggal", "venue"].map((field) => (
          <div key={field}>
            <Label className="capitalize text-white">{field}</Label>
            <Input
              type={field === "tanggal" ? "date" : "text"}
              required={field !== "venue"}
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
            />
          </div>
        ))}
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Simpan Konser
        </Button>
      </form>
    </div>
  );
}
