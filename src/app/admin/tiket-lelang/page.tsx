"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";

interface Tiket {
  id: number;
  harga_awal: number;
  harga_beli: number;
  kelipatan: number;
  batas_waktu: string;
  statusLelang: string;
  jumlah: number;
  konser: { nama: string };
  kategori: { nama: string };
  user?: { name: string };
}

export default function KelolaTiketLelangPage() {
  const [data, setData] = useState<Tiket[]>([]);

  useEffect(() => {
    fetch("/api/admin/tiket-lelang")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("❌ Gagal ambil data tiket:", err));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Data Tiket Lelang</h2>
      <div className="space-y-4">
        {data.map((tiket) => (
          <Card
            key={tiket.id}
            className="bg-gray-800 border border-gray-700 text-white p-4"
          >
            <div className="text-lg font-semibold mb-1">{tiket.konser.nama} — {tiket.kategori.nama}</div>
            <div className="text-sm text-gray-300">
              🎫 Jumlah: {tiket.jumlah} | 💰 Awal: Rp {tiket.harga_awal?.toLocaleString()} | Beli: Rp {tiket.harga_beli?.toLocaleString()} <br />
              ⏱ Batas: {format(new Date(tiket.batas_waktu), "d MMMM yyyy, HH:mm", { locale: id })} | 📈 Kelipatan: Rp {tiket.kelipatan?.toLocaleString()} <br />
              🧑 Penjual: {tiket.user?.name || "-"} | Status: <b>{tiket.statusLelang}</b>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
