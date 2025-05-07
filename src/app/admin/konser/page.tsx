// app/admin/konser/page.tsx


"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KelolaKonserPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/konser")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Gagal fetch konser:", err));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Kelola Konser</h2>

      <div className="grid grid-cols-1 gap-4">
        {data.map((konser: any) => (
          <Card key={konser.id} className="bg-slate-800 text-white">
            <CardHeader>
              <CardTitle>{konser.nama}</CardTitle>
              <p className="text-sm">
                {new Date(konser.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                – {konser.venue}
              </p>
              <p className="italic text-sm text-gray-400">{konser.lokasi}</p>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
