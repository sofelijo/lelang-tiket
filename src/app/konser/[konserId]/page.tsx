// FULL CODE dengan efek skeleton loader versi PLAYFUL (emoji + warna pastel + bounce)

"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();
  const [konser, setKonser] = useState<any>(null);
  const [tiketList, setTiketList] = useState<any[]>([]);
  const [metode, setMetode] = useState<"LELANG" | "JUAL_LANGSUNG">("LELANG");
  const [kategoriAktif, setKategoriAktif] = useState<string | null>(null);
  const [jumlahAktif, setJumlahAktif] = useState<string | null>(null);
  const [filterSebelahan, setFilterSebelahan] = useState<null | boolean>(null);
  const [sortBy, setSortBy] = useState<string>("terpopuler");
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const query = new URLSearchParams({
        konserId: String(konserId),
        metode,
        ...(kategoriAktif ? { kategori: kategoriAktif } : {}),
        ...(filterSebelahan !== null
          ? { sebelahan: String(filterSebelahan) }
          : {}),
        ...(jumlahAktif ? { jumlah: jumlahAktif } : {}),
        sort: sortBy,
      }).toString();

      try {
        const konserRes = await fetch(`/api/konser/${konserId}`);
        const tiketRes = await fetch(`/api/ticket/filter?${query}`);
        const konserData = await konserRes.json();
        const tiketData = await tiketRes.json();

        const tiketWithEstimasi = await Promise.all(
          tiketData.map(async (t: any) => {
            try {
              // 1. Hitung metode termurah
              const resTermurah = await fetch(
                `/api/pembayaran/estimasi?ticketId=${t.id}&mode=termurah-all&harga_dasar=${t.hargaTotal}`
              );
              const termurahList = await resTermurah.json();
              const termurah = Array.isArray(termurahList)
                ? termurahList[0]
                : null;

              if (!termurah?.metode) {
                return {
                  ...t,
                  estimasiTotal: null,
                  estimasiSatuan: null,
                  estimasiMetode: null,
                };
              }

              // 2. Hitung estimasi berdasarkan metode termurah
              const resDetail = await fetch(
                `/api/pembayaran/estimasi?ticketId=${t.id}&mode=detail&metode=${termurah.metode}&harga_dasar=${t.hargaTotal}`
              );
              const final = await resDetail.json();
              // 🔍 Tambahkan log di sini
              console.log("✅ Estimasi untuk Tiket:", {
                id: t.id,
                hargaTotal: t.hargaTotal,
                estimasiTotal: final.totalBayar,
                estimasiSatuan: final.hargaPerTiket,
                metode: final.metode,
              });
              return {
                ...t,
                estimasiTotal: final.totalBayar,
                estimasiSatuan: final.hargaPerTiket,
                estimasiMetode: final.metode,
              };
            } catch (err) {
              console.error(`❌ Gagal hitung estimasi tiket ${t.id}:`, err);
              return {
                ...t,
                estimasiTotal: null,
                estimasiSatuan: null,
                estimasiMetode: null,
              };
            }
          })
        );

        setKonser(konserData);
        setTiketList(tiketWithEstimasi);
      } catch (err) {
        console.error("Gagal fetch data konser/tiket:", err);
      }

      setLoading(false);
    }

    if (konserId) fetchData();
  }, [konserId, metode, kategoriAktif, filterSebelahan, sortBy, jumlahAktif]);

  if (!konser) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="lg:w-1/3 space-y-4">
            <Card className="overflow-hidden animate-pulse bg-yellow-50 border border-yellow-200">
              <div className="w-full h-[200px] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-2/3" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
            </Card>
            <div className="h-10 bg-green-300 rounded animate-bounce" />
          </div>

          {/* Main Skeleton */}
          <div className="lg:w-2/3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="p-4 animate-pulse flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-200 shadow"
              >
                <div className="flex items-center gap-6 text-sm flex-wrap w-full">
                  <div className="w-[150px] h-4 rounded bg-pink-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">🎫</span>
                  </div>
                  <div className="w-[120px] h-4 rounded bg-blue-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">💰</span>
                  </div>
                  <div className="w-[100px] h-4 rounded bg-green-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">🎶</span>
                  </div>
                  <div className="w-[100px] h-4 rounded bg-purple-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">⏳</span>
                  </div>
                  <div className="w-[130px] h-4 rounded bg-orange-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">👥</span>
                  </div>
                </div>
                <div className="w-16 h-8 rounded bg-green-300 flex items-center justify-center animate-bounce">
                  🎉
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kategoriList = konser.kategori || [];

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 px-4 py-6">
      <aside className="lg:w-1/3 sticky top-4 self-start h-fit space-y-4">
        <Card className="overflow-hidden">
          <img
            src={konser.image}
            alt="banner konser"
            className="w-full h-100 object-cover"
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
        <Button
          onClick={() => {
            startTransition(() => {
              router.push(`/tambah-tiket?step=2&konserId=${konser.id}`);
            });
          }}
          disabled={isPending}
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>➕ Tambah Tiket untuk Konser Ini</>
          )}
        </Button>
      </aside>

      <section className="lg:w-4/5 space-y-4">
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

        <div className="flex flex-nowrap gap-2 overflow-x-auto items-center pb-2">
          {/* Select Kategori */}
          <Select
            value={kategoriAktif ?? "semua"}
            onValueChange={(val) =>
              setKategoriAktif(val === "semua" ? null : val)
            }
          >
            <SelectTrigger className="min-w-[140px] h-9 bg-black text-white text-sm border border-white/20 rounded-md px-3">
              <SelectValue placeholder="🟧 Kategori" />
            </SelectTrigger>
            <SelectContent className="bg-muted text-black">
              <SelectItem value="semua">🟧 Kategori</SelectItem>
              {kategoriList.map((kat: string) => (
                <SelectItem key={kat} value={kat}>
                  {kat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Select Jumlah */}
          <select
            className="min-w-[140px] h-9 text-sm bg-black text-white border border-white/20 rounded-md px-3"
            value={jumlahAktif ?? ""}
            onChange={(e) => setJumlahAktif(e.target.value || null)}
          >
            <option value="">🟦 Jumlah</option>
            {[1, 2, 3, 4, 5].map((jml) => (
              <option key={jml} value={jml}>
                {jml} Tiket
              </option>
            ))}
          </select>
          <Separator orientation="vertical" className="h-5" />
          {/* Filter Sebelahan */}
          {[true, false].map((val) => (
            <Badge
              key={String(val)}
              onClick={() =>
                setFilterSebelahan(filterSebelahan === val ? null : val)
              }
              className={cn(
                "h-9 px-3 min-w-[120px] justify-center cursor-pointer text-sm rounded-md transition-all whitespace-nowrap",
                filterSebelahan === val
                  ? "border border-white bg-white/10 text-white"
                  : "border border-white/10 text-muted-foreground bg-transparent"
              )}
            >
              {val ? "✅ Sebelahan" : "🚫 Tidak"}
            </Badge>
          ))}
          <Separator orientation="vertical" className="h-5" />
          {/* Sort by */}
          <Badge
            onClick={() => setSortBy("terpopuler")}
            className={cn(
              "hidden md:inline-flex h-9 px-3 min-w-[140px] justify-center cursor-pointer text-sm rounded-md transition-all whitespace-nowrap",
              sortBy === "terpopuler"
                ? "border border-white bg-white/10 text-white"
                : "border border-white/10 text-muted-foreground bg-transparent"
            )}
          >
            🔥 Terpopuler
          </Badge>

          {/* 🆕 Terbaru → hanya tampil di desktop */}
          <Badge
            onClick={() => setSortBy("terbaru")}
            className={cn(
              "hidden md:inline-flex h-9 px-3 min-w-[140px] justify-center cursor-pointer text-sm rounded-md transition-all whitespace-nowrap",
              sortBy === "terbaru"
                ? "border border-white bg-white/10 text-white"
                : "border border-white/10 text-muted-foreground bg-transparent"
            )}
          >
            🆕 Terbaru
          </Badge>
        </div>

        <Card className="hidden md:flex p-4 items-center justify-between gap-4 bg-gray-100 border-b text-xs uppercase font-semibold text-black tracking-wide">
          <div className="flex items-center gap-6 flex-wrap w-full">
            <div
              className="w-[150px] cursor-pointer"
              onClick={() =>
                setSortBy(
                  sortBy === "termurah_satuan"
                    ? "termahal_satuan"
                    : "termurah_satuan"
                )
              }
            >
              Harga Satuan
            </div>
            <div
              className="w-[120px] cursor-pointer"
              onClick={() =>
                setSortBy(
                  sortBy === "termurah_total"
                    ? "termahal_total"
                    : "termurah_total"
                )
              }
            >
              Total Harga
            </div>
            <div className="w-[100px]">Kategori</div>
            <div
              className="w-[100px] cursor-pointer"
              onClick={() =>
                setSortBy(sortBy === "mauhabis" ? "populer" : "mauhabis")
              }
            >
              Sisa Waktu
            </div>
            <div className="w-[130px]">Jumlah Tiket</div>
          </div>
        </Card>
        {/* Header Sort - hanya tampil di mobile */}
        <div className="block md:hidden mb-3">
          <Select
            onValueChange={(value) => setSortBy(value)}
            defaultValue={sortBy}
          >
            <SelectTrigger className="w-full h-10 bg-gray-100 text-black border border-gray-300 text-sm font-semibold tracking-wide uppercase">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent className="bg-white text-sm">
              <SelectItem value="termurah_satuan">
                Harga Satuan Termurah
              </SelectItem>
              <SelectItem value="termahal_satuan">
                Harga Satuan Termahal
              </SelectItem>
              <SelectItem value="termurah_total">
                Total Harga Termurah
              </SelectItem>
              <SelectItem value="termahal_total">
                Total Harga Termahal
              </SelectItem>
              <SelectItem value="mauhabis">Sisa Waktu Paling Dikit</SelectItem>
              <SelectItem value="populer">Tiket Terpopuler</SelectItem>
              <SelectItem value="terbaru">Terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="p-4 animate-pulse flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-200 shadow"
              >
                <div className="flex items-center gap-6 text-sm flex-wrap w-full">
                  <div className="w-[150px] h-4 rounded bg-pink-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">🎫</span>
                  </div>
                  <div className="w-[120px] h-4 rounded bg-blue-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">💰</span>
                  </div>
                  <div className="w-[100px] h-4 rounded bg-green-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">🎶</span>
                  </div>
                  <div className="w-[100px] h-4 rounded bg-purple-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">⏳</span>
                  </div>
                  <div className="w-[130px] h-4 rounded bg-orange-200 flex items-center justify-center">
                    <span className="text-xs opacity-40">👥</span>
                  </div>
                </div>
                <div className="w-16 h-8 rounded bg-green-300 flex items-center justify-center animate-bounce">
                  🎉
                </div>
              </Card>
            ))}
          </div>
        ) : tiketList.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <div className="text-4xl mb-4">😶</div>
            <h2 className="text-lg font-semibold">
              Belum ada tiket yang cocok
            </h2>
            <p className="text-sm">Coba ubah filter atau pilih kategori lain</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[65vh] pr-1 scrollable-container">
            {/* ✅ MOBILE: grid 2 kolom */}
            <div className="grid grid-cols-2 gap-4 md:hidden">
              {tiketList.map((tiket) => {
                const hargaTotal = tiket.hargaTotal;
                const hargaSatuan = tiket.hargaSatuan;
                const jamSisa = tiket.batas_waktu
                  ? (new Date(tiket.batas_waktu).getTime() - Date.now()) /
                    (1000 * 60 * 60)
                  : null;
                const waktu = jamSisa !== null ? formatCountdown(jamSisa) : "-";
                const waktuClass =
                  jamSisa !== null
                    ? jamSisa <= 1
                      ? "text-red-500 animate-blink-fast"
                      : jamSisa <= 3
                      ? "text-red-500 animate-blink-slow"
                      : jamSisa <= 6
                      ? "text-red-500"
                      : jamSisa <= 12
                      ? "text-yellow-500"
                      : "text-foreground"
                    : "text-foreground";

                return (
                  <Card
                    key={tiket.id}
                    className="p-4 flex flex-col gap-3 border border-muted bg-white/90 hover:shadow-lg transition"
                  >
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="font-semibold text-base text-foreground">
                        {typeof hargaSatuan === "number" &&
                        typeof hargaTotal === "number" ? (
                          <>
                            Rp{" "}
                            {(
                              Math.round(hargaSatuan / 1000) * 1000
                            ).toLocaleString()}{" "}
                            <span className="text-xs text-muted-foreground">
                              / Tiket
                            </span>
                            <div className="text-xs text-muted-foreground">
                              (Total Rp{" "}
                              {(
                                Math.round(hargaTotal / 1000) * 1000
                              ).toLocaleString()}
                              )
                            </div>
                          </>
                        ) : (
                          "Rp -"
                        )}
                      </div>

                      <div>
                        <div className="font-medium text-foreground">
                          {tiket.kategori.nama}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tiket.jumlah} tiket{" "}
                          {tiket.sebelahan ? "(bersama)" : "(terpisah)"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className={cn("text-sm font-medium", waktuClass)}>
                        {waktu}
                      </div>
                      <a
                        href={`/ticket/${tiket.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[120px]"
                      >
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                        >
                          {tiket.kelipatan ? "Bid" : "Beli"}
                        </Button>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* ✅ DESKTOP: list vertikal */}
            <div className="hidden md:flex flex-col gap-4">
              {tiketList.map((tiket) => {
                const hargaTotal = tiket.hargaTotal;
                const hargaSatuan = tiket.hargaSatuan;
                const jamSisa = tiket.batas_waktu
                  ? (new Date(tiket.batas_waktu).getTime() - Date.now()) /
                    (1000 * 60 * 60)
                  : null;
                const waktu = jamSisa !== null ? formatCountdown(jamSisa) : "-";
                const waktuClass =
                  jamSisa !== null
                    ? jamSisa <= 1
                      ? "text-red-500 animate-blink-fast"
                      : jamSisa <= 3
                      ? "text-red-500 animate-blink-slow"
                      : jamSisa <= 6
                      ? "text-red-500"
                      : jamSisa <= 12
                      ? "text-yellow-500"
                      : "text-foreground"
                    : "text-foreground";

                return (
                  <Card
                    key={tiket.id}
                    className="p-4 hidden md:flex justify-between items-center bg-white border"
                  >
                    <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                      <div className="w-[150px] font-bold text-base text-foreground">
                        {typeof hargaSatuan === "number"
                          ? `Rp ${(
                              Math.round(hargaSatuan / 1000) * 1000
                            ).toLocaleString()}`
                          : "Rp -"}
                      </div>
                      <div className="w-[120px]">
                        {typeof hargaTotal === "number"
                          ? `Rp ${(
                              Math.round(hargaTotal / 1000) * 1000
                            ).toLocaleString()}`
                          : "Rp -"}
                      </div>
                      <div className="w-[100px]">{tiket.kategori.nama}</div>
                      <div className={cn("w-[100px] font-medium", waktuClass)}>
                        {waktu}
                      </div>
                      <div className="w-[130px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {tiket.jumlah} tiket{" "}
                        {tiket.sebelahan ? "(Bersama)" : "(Terpisah)"}
                      </div>
                    </div>
                    <a
                      href={`/ticket/${tiket.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white w-full md:w-[100px]"
                      >
                        {tiket.kelipatan ? "Bid" : "Beli"}
                      </Button>
                    </a>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
