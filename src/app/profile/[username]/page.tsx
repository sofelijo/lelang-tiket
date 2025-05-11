"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const perPage = 5;

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`/api/public-user/${username}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [username]);

  const filtered = data?.riwayatTiket.filter(
    (t: any) => filter === "ALL" || t.statusLelang === filter
  ) || [];

  const visibleTickets = filtered.slice(0, page * perPage);

  useEffect(() => {
    if (!loadMoreRef.current || visibleTickets.length >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setPage((prev) => prev + 1);
            setIsFetchingMore(false);
          }, 800);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleTickets.length, filtered.length]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* KIRI: Profil */}
      <div className="md:col-span-1 space-y-4">
  {loading ? (
    <>
      <Card className="p-4 text-center space-y-3">
        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-3 w-1/3 mx-auto" />
        <Skeleton className="h-4 w-full" />
      </Card>
      <Card className="p-4 text-center bg-green-50 border-green-200">
        <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-6 w-1/3 mx-auto" />
      </Card>
    </>
  ) : (
    <>
      <Card className="p-4 text-center">
        <Image
          src={data.image || "/user-default.png"}
          alt="profile"
          width={100}
          height={100}
          className="mx-auto rounded-full object-cover h-24 w-24"
        />
        <h2 className="text-lg font-semibold mt-2">{data.name || "Tanpa Nama"}</h2>
        <p className="text-sm text-muted-foreground">@{data.username}</p>
        <p className="mt-2 text-sm text-muted-foreground italic">
          {data.bio || "Belum nulis bio nih 😗"}
        </p>
      </Card>

      {/* Info Tiket */}
      <Card className="p-4 text-center bg-green-50 border-green-200 space-y-1">
        <p className="text-sm text-muted-foreground">Total Tiket Terjual</p>
        <h3 className="text-2xl font-bold text-green-700">
          {data.totalTiketTerjual} 🎉
        </h3>
        <p className="text-xs text-muted-foreground">
          dari {data.jumlahListingTerjual} listing yang selesai ✅
        </p>
      </Card>
    </>
  )}
</div>


      {/* KANAN: Riwayat Tiket */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">🎟️ Riwayat Jualan Tiket</h3>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="border border-input bg-background rounded-md px-3 py-1 text-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="SELESAI">SELESAI</option>
            <option value="BERLANGSUNG">BERLANGSUNG</option>
            <option value="PENDING">PENDING</option>
            <option value="BOOKED">BOOKED</option>
          </select>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 flex flex-col md:flex-row gap-4 bg-blue-50/40 border-blue-100">
              <Skeleton className="h-24 w-full md:w-40 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : visibleTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada tiket untuk status ini 👀</p>
        ) : (
          visibleTickets.map((t: any, i: number) => (
            <Card key={i} className="p-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 h-24 relative">
                <Image
                  src={t.konser.image || "/placeholder.jpg"}
                  alt="banner konser"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-base">{t.konser.nama}</h4>
                <p className="text-xs text-muted-foreground">
                  🗓️ {format(new Date(t.konser.tanggal), "dd MMM yyyy")} | 📍{" "}
                  {t.konser.lokasi}
                </p>
                <p className="text-sm">🎫 {t.kategori.nama}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">💸 Rp {t.harga_beli?.toLocaleString() || 0}</Badge>
                  <Badge variant="outline">🪑 {t.tipeTempat}</Badge>
                  <Badge variant="outline">{t.sebelahan ? "👯‍♂️ Sebelahan" : "🔀 Acak"}</Badge>
                  <Badge variant="outline">🎟️ {t.jumlah}</Badge>
                  <Badge
                    variant="default"
                    className={
                      t.statusLelang === "SELESAI"
                        ? "bg-green-600 hover:bg-green-700"
                        : t.statusLelang === "BERLANGSUNG"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-slate-500 hover:bg-slate-600"
                    }
                  >
                    {t.statusLelang}
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}

        {visibleTickets.length < filtered.length && (
          <div ref={loadMoreRef} className="space-y-2 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-4 flex flex-col md:flex-row gap-4 bg-pink-50/50 border-pink-200">
                <Skeleton className="h-24 w-full md:w-40 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
            <p className="text-xs text-center text-muted-foreground">⏳ Lagi diambilin tiketnya...</p>
          </div>
        )}
      </div>
    </div>
  );
}
