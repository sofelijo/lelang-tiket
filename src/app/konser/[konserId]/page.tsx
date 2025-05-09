"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function formatCountdown(jam: number): string {
  const totalSeconds = Math.floor(jam * 3600);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0)
    return `${String(days).padStart(2, "0")}D${String(hours).padStart(
      2,
      "0"
    )}H`;
  if (hours > 0)
    return `${String(hours).padStart(2, "0")}H${String(minutes).padStart(
      2,
      "0"
    )}M`;
  return `${String(minutes).padStart(2, "0")}M${String(seconds).padStart(
    2,
    "0"
  )}S`;
}

export default function TiketByKonserPage() {
  const { konserId } = useParams();
  const [konser, setKonser] = useState<any>(null);
  const [tiketList, setTiketList] = useState<any[]>([]);
  const [metode, setMetode] = useState<"LELANG" | "JUAL_LANGSUNG">("LELANG");
  const [kategoriAktif, setKategoriAktif] = useState<string | null>(null);
  const [filterSebelahan, setFilterSebelahan] = useState<null | boolean>(null);
  const [sortBy, setSortBy] = useState<"populer" | "mauhabis" | "murah">(
    "populer"
  );
  const [hargaMurahMode, setHargaMurahMode] = useState<"total" | "satuan">(
    "total"
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchData() {
      try {
        const konserRes = await fetch(`/api/konser/${konserId}`);
        const tiketRes = await fetch(`/api/ticket/konser?konserId=${konserId}`);
        const konserData = await konserRes.json();
        const tiketData = await tiketRes.json();
        setKonser(konserData);
        setTiketList(tiketData);
      } catch (err) {
        console.error("Gagal fetch data konser/tiket:", err);
      }
    }

    if (konserId) {
      fetchData();
      interval = setInterval(() => {
        setTiketList((prev) => [...prev]); // trigger render ulang utk countdown
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [konserId]);

  if (!konser) return <div className="p-6 text-center">Loading konser...</div>;

  const kategoriList = konser.kategori || [];

  const tiketTerfilter = tiketList.filter((t) => {
    if (t.metode !== metode) return false;
    if (kategoriAktif && t.kategori !== kategoriAktif) return false;
    if (filterSebelahan !== null && t.sebelahan !== filterSebelahan)
      return false;
    return true;
  });

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 px-4 py-6">
      {/* Sidebar Konser */}
      <aside className="lg:w-1/3 sticky top-4 self-start h-fit space-y-4">
        <Card className="overflow-hidden">
          <img
            src={konser.image}
            alt="banner konser"
            className="w-full h-48 object-cover"
          />
          <div className="p-4 space-y-2">
            <h1 className="text-xl font-bold">{konser.nama}</h1>
            <p className="text-sm text-muted-foreground">
              📍 {konser.venue}, {konser.lokasi}
            </p>
            <p className="text-sm">
              📅 {format(new Date(konser.tanggal), "dd MMMM yyyy")}
            </p>
          </div>
        </Card>
      </aside>

      {/* Content Tiket */}
      <section className="lg:w-2/3 space-y-4">
        {/* Tab: Lelang vs Jual */}
        <div className="flex gap-2">
          {(["LELANG", "JUAL_LANGSUNG"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMetode(type)}
              className={cn(
                "w-1/2 py-2 rounded-md text-sm font-medium transition-colors",
                metode === type
                  ? "bg-black text-white shadow-sm shadow-white/50"
                  : "bg-white text-muted-foreground border"
              )}
            >
              {type === "LELANG" ? "🎯 Lelang" : "💸 Jual Langsung"}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="px-3 py-2 border rounded-md bg-background text-sm text-black dark:text-white"
            value={kategoriAktif ?? ""}
            onChange={(e) => setKategoriAktif(e.target.value || null)}
          >
            <option value="">🎟️ Semua Kategori</option>
            {kategoriList.map((kat: string) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>

          <Separator orientation="vertical" className="h-5" />

          {[true, false].map((val) => (
            <Badge
              key={String(val)}
              onClick={() =>
                setFilterSebelahan(filterSebelahan === val ? null : val)
              }
              className={cn(
                "cursor-pointer",
                filterSebelahan === val
                  ? "border border-white text-white"
                  : "border border-muted-foreground/20 text-muted-foreground"
              )}
            >
              {val ? "✅ Sebelahan" : "🚫 Tidak Sebelahan"}
            </Badge>
          ))}

          <Separator orientation="vertical" className="h-5" />

          {/* Sort */}
          <Badge
            onClick={() => setSortBy("populer")}
            className={cn(
              "cursor-pointer",
              sortBy === "populer"
                ? "border border-white text-white"
                : "border border-muted-foreground/20 text-muted-foreground"
            )}
          >
            🔥 Terpopuler
          </Badge>
          <Badge
            onClick={() => setSortBy("mauhabis")}
            className={cn(
              "cursor-pointer",
              sortBy === "mauhabis"
                ? "border border-white text-white"
                : "border border-muted-foreground/20 text-muted-foreground"
            )}
          >
            ⏳ Mau Habis
          </Badge>
          {sortBy === "murah" ? (
            <select
              className="px-3 py-1 text-sm rounded-md border bg-background text-black dark:text-white border-white dark:bg-muted"
              value={hargaMurahMode}
              onChange={(e) =>
                setHargaMurahMode(e.target.value as "total" | "satuan")
              }
            >
              <option value="total">💰 Total</option>
              <option value="satuan">💡 Satuan</option>
            </select>
          ) : (
            <Badge
              onClick={() => setSortBy("murah")}
              className="cursor-pointer border border-muted-foreground/20 text-muted-foreground"
            >
              💰 Termurah
            </Badge>
          )}
        </div>

        {/* 👉 Header kolom */}
        <Card className="p-4 flex items-center justify-between gap-4 bg-gray-100 border-b text-xs uppercase font-semibold text-black tracking-wide">
          <div className="flex items-center gap-6 flex-wrap w-full">
            <div className="w-[120px]">Total Harga</div>
            <div className="w-[150px]">Harga Satuan</div>
            <div className="w-[100px]">Kategori</div>
            <div className="w-[100px]">Sisa Waktu</div>
            <div className="w-[130px]">Jumlah Tiket</div>
          </div>
         
        </Card>

        {/* List Tiket */}
        <div className="overflow-y-auto max-h-[65vh] pr-1 scrollable-container">

       
        <div className="space-y-3">
          {tiketTerfilter.map((tiket) => {
            const hargaTotal =
              tiket.metode === "LELANG"
                ? tiket.harga_bid ?? tiket.harga_awal
                : tiket.harga_beli;
            const hargaSatuan = hargaTotal / tiket.jumlah;
            const labelSebelah = tiket.sebelahan ? "(Bersama)" : "(Terpisah)";
            const jamSisa = tiket.batas_waktu
              ? (new Date(tiket.batas_waktu).getTime() - Date.now()) /
                (1000 * 60 * 60)
              : null;
            const waktu = jamSisa !== null ? formatCountdown(jamSisa) : "-";

            let waktuClass = "text-foreground";
            if (jamSisa !== null) {
              if (jamSisa <= 1) waktuClass = "text-red-500 animate-blink-fast";
              else if (jamSisa <= 3)
                waktuClass = "text-red-500 animate-blink-slow";
              else if (jamSisa <= 6) waktuClass = "text-red-500";
              else if (jamSisa <= 12) waktuClass = "text-yellow-500";
            }

            return (
              <Card
                key={tiket.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="w-[120px] font-bold text-base text-foreground">
                    Rp {hargaTotal.toLocaleString()}
                  </div>

                  <div className="w-[150px]">
                    Rp {hargaSatuan.toLocaleString()} / tiket
                  </div>
                  <div className="w-[100px]">{tiket.kategori}</div>
                  <div className={cn("w-[100px] font-medium", waktuClass)}>
                    {waktu}
                  </div>
                  <div className="w-[130px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {tiket.jumlah} tiket {labelSebelah}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {tiket.metode === "LELANG" ? "Bid" : "Beli"}
                </Button>
              </Card>
            );
          })}
        </div>
        </div>
      </section>
    </div>
  );
}
