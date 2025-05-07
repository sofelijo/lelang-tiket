// app/admin/tiket-jual/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

interface Tiket {
  id: number;
  seat: string | null;
  tipeTempat: string;
  harga_beli: number | null;
  deskripsi: string | null;
  jumlah: number;
  sebelahan: boolean | null;
  createdAt: string;
  konser: { nama: string };
  kategori: { nama: string };
  user: { name: string } | null;
}

export default function TiketJualPage() {
  const [tiketList, setTiketList] = useState<Tiket[]>([]);

  useEffect(() => {
    fetch("/api/admin/tiket-jual")
      .then((res) => res.json())
      .then(setTiketList)
      .catch((err) => console.error("Gagal ambil data tiket jual:", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Tiket Jual Langsung</h2>
      <div className="space-y-4">
        {tiketList.map((tiket) => (
          <div
            key={tiket.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white"
          >
            <h3 className="text-lg font-semibold">
              {tiket.konser.nama} - {tiket.kategori.nama}
            </h3>
            <p className="text-sm text-gray-400">
              Dibuat oleh: {tiket.user?.name || "Tidak diketahui"} • {format(new Date(tiket.createdAt), "d MMMM yyyy", { locale: localeID })}
            </p>
            <p className="text-sm text-gray-300">Harga: Rp {tiket.harga_beli?.toLocaleString("id-ID")}</p>
            <p className="text-sm text-gray-300">Jumlah: {tiket.jumlah}</p>
            <p className="text-sm text-gray-300">Tipe: {tiket.tipeTempat}</p>
            <p className="text-sm text-gray-300">Sebelahan: {tiket.sebelahan ? "Ya" : "Tidak"}</p>
            <p className="text-sm text-gray-400 italic mt-2">{tiket.deskripsi}</p>
          </div>
        ))}
      </div>
    </div>
  );
}