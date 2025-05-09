"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CommentSection from "@/app/components/lainnya/CommentSection";
import { Separator } from "@/components/ui/separator";

export default function DetailTiketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch tiket dari API
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/ticket/${id}`);
      const data = await res.json();
      setTicket(data);
    }
    if (id) fetchData();
  }, [id]);

  // Hitung countdown tiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (!ticket?.batas_waktu) return;
      const selisih = Math.floor(
        (new Date(ticket.batas_waktu).getTime() - Date.now()) / 1000
      );
      setTimeLeft(Math.max(selisih, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  // Set default bidAmount setelah ticket tersedia
  useEffect(() => {
    if (ticket) {
      const lastBid = ticket.bids?.[0]?.amount ?? null;
      const min = lastBid ? lastBid + ticket.kelipatan : ticket.harga_awal;
      setBidAmount(min);
    }
  }, [ticket]);

  // Fungsi format countdown
  const formatCountdown = (s: number) => {
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${days}D ${String(hours).padStart(2, "0")}H ${String(
      minutes
    ).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
  };

  if (!ticket) return <div className="p-6">⏳ Loading tiket...</div>;

  // Perhitungan tambahan untuk estimasi total bayar
  const total = bidAmount;
  const feePlatform = Math.max(Math.floor(total * 0.03), 37000);
  const totalBayar = total + feePlatform;
  const hargaPerTiket = Math.floor(total / ticket.jumlah);
  const minBid = ticket.bids?.[0]?.amount
    ? ticket.bids[0].amount + ticket.kelipatan
    : ticket.harga_awal ?? 0;

  return (
    <main className="p-6">
      {typeof timeLeft === "number" && (
        <div className="text-center text-sm font-semibold text-red-500">
          ⏳ Sisa waktu lelang: {formatCountdown(timeLeft)}
        </div>
      )}
      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Tiket */}

        <div className="space-y-3">
          <Card className="p-0 overflow-hidden h-full">
            <img
              src={ticket.konser.image || "/dummy-konser.jpg"}
              alt="Gambar konser"
              className="w-full h-200 object-cover"
            />
            <div className="p-4 space-y-2">
              <h2 className="text-lg font-bold">🎤 {ticket.konser.nama}</h2>
              <p className="text-sm text-muted-foreground text-right">
                📅 {new Date(ticket.konser.tanggal).toLocaleDateString()}
                <br />
                📍 {ticket.konser.venue}, {ticket.konser.lokasi}
              </p>
              <Separator />
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {ticket.tipeTempat === "Duduk"
                    ? "🪑 Duduk"
                    : ticket.tipeTempat === "Berdiri"
                    ? "💃🏼 Berdiri"
                    : ticket.tipeTempat}
                </span>

                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  💺 Seat: {ticket.seat ?? "Bebas"}
                </span>

                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  🎟️ Jumlah: {ticket.jumlah}
                </span>
              </div>
              <p>🎟️ Kategori: {ticket.kategori.nama}</p>

              <p>🔗 Status Lelang: {ticket.statusLelang}</p>
              <p>🤝 {ticket.sebelahan ? "Sebelahan 👫" : "Pisah-pisah 😬"}</p>
              {ticket.deskripsi && <p>📝 {ticket.deskripsi}</p>}
              <p className="text-xs text-muted-foreground text-center">
                🔥Gk sabar? mau beli langsung?👇
              </p>

              <div className="flex gap-2">
                <Button className="bg-red-600 hover:bg-red-700 text-white flex-1">
                  <div className="text-xs leading-tight text-center">
                    Beli Langsung
                    <br />
                    <span className="text-sm font-bold">
                      Rp {ticket.harga_beli?.toLocaleString()}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tengah - Bid & Riwayat */}
        <div className="space-y-4">
          {/* Countdown */}

          {/* Riwayat Bid */}
          <Card className="p-4 space-y-4 h-full min-h-[500px] flex flex-col justify-between">
            {/* Riwayat Bid - kontainer tetap dengan scroll */}
            <div className="bg-muted rounded-md p-3 h-64 overflow-y-auto space-y-2 border border-muted-foreground/10">
              <h3 className="font-semibold text-sm">📈 Riwayat Tawaran</h3>
              {ticket.bids.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada yang ngebid 😢
                </p>
              ) : (
                ticket.bids.map((bid: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b last:border-none pb-1"
                  >
                    <span>💰 Rp {bid.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      {bid.user?.name ?? "Anonim"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Setup Bid Konten */}
            <div className="space-y-3 pt-2">
              <div className="text-sm text-muted-foreground">
                <p>🏁 Harga Awal: Rp {ticket.harga_awal.toLocaleString()}</p>
                <p>💸 Kelipatan: Rp {ticket.kelipatan.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBidAmount((prev) =>
                      Math.max(minBid, prev - ticket.kelipatan)
                    )
                  }
                  disabled={bidAmount <= minBid}
                >
                  -
                </Button>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="border px-4 py-2 rounded w-full text-center bg-background text-foreground"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBidAmount((prev) => prev + ticket.kelipatan)
                  }
                >
                  +
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                💡 Harga per tiket (estimasi): Rp{" "}
                {hargaPerTiket.toLocaleString()}
              </div>

              <div className="text-sm font-medium">
                💰 Estimasi total bayar:{" "}
                <span className="text-foreground">
                  Rp {totalBayar.toLocaleString()}
                </span>
                <p className="text-xs text-muted-foreground">
                  *Udah all-in gengs! Termasuk 3% platform + fee transfer 😎
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                  Bid Sekarang
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Komentar */}
        <div>
          <CommentSection itemId={String(ticket.id)} itemType="ticket" />
        </div>
      </div>
    </main>
  );
}
