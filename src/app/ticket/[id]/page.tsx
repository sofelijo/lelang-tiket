"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import CommentSection from "@/app/components/lainnya/CommentSection";

export default function DetailTiketPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [estimasiBidTertinggi, setEstimasiBidTertinggi] = useState<any>(null);
  const [estimasiUserBid, setEstimasiUserBid] = useState<any>(null);
  const [isLoadingBid, setIsLoadingBid] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/ticket/${id}`);
      const data = await res.json();
      setTicket(data);
    }
    if (id) fetchData();
  }, [id]);

  const penjualTerjual = ticket?.user?.tickets?.reduce(
    (acc: number, t: any) => acc + (t.jumlah ?? 0),
    0
  );

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

  useEffect(() => {
    if (ticket) {
      const lastBid = ticket.bids?.[0]?.amount ?? null;
      const min = lastBid ? lastBid + ticket.kelipatan : ticket.harga_awal;
      setBidAmount(min);

      // Estimasi untuk bid tertinggi
      const hargaDasar = lastBid ?? ticket.harga_awal;
      fetch(
        `/api/pembayaran/estimasi?ticketId=${ticket.id}&mode=termurah-all&harga_dasar=${hargaDasar}`
      )
        .then((res) => res.json())
        .then((data) => {
          const termurah = Array.isArray(data) ? data[0] : null;
          if (termurah) setEstimasiBidTertinggi(termurah);
        });
    }
  }, [ticket]);

  useEffect(() => {
    if (!ticket || !bidAmount) return;
    fetch(
      `/api/pembayaran/estimasi?ticketId=${ticket.id}&mode=termurah-all&harga_dasar=${bidAmount}`
    )
      .then((res) => res.json())
      .then((data) => {
        const termurah = Array.isArray(data) ? data[0] : null;
        if (termurah) setEstimasiUserBid(termurah);
      });
  }, [bidAmount, ticket]);

  const formatCountdown = (s: number) => {
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${days}D ${String(hours).padStart(2, "0")}H ${String(
      minutes
    ).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
  };

  const formatHarga = (value: number) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  const handleBid = async () => {
    if (!ticket) return;
    if (!bidAmount || bidAmount < ticket.harga_awal) {
      toast({
        title: "❌ Gagal bid",
        description: "💸 Bid harus lebih tinggi dari harga awal yaa",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingBid(true);
    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, amount: bidAmount }),
      });
      if (res.ok) {
        toast({
          title: "🎯 Bid berhasil dikirim!",
          description: formatHarga(bidAmount) + " udah masuk gan!",
        });
        const updated = await fetch(`/api/ticket/${id}`);
        const refreshed = await updated.json();
        setTicket(refreshed);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Gagal bid, coba lagi yaa");
      }
    } catch (err: any) {
      toast({
        title: "❌ Gagal bid",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingBid(false);
    }
  };

  const handleBuy = () => {
    if (!ticket?.id) return;
    setIsLoadingBuy(true);
    router.push(`/bayar/${ticket.id}`);
  };

  if (!ticket) return <div className="p-6">⏳ Loading tiket...</div>;

  const penjualSelesai = ticket.user.tickets?.length || 0;
  const bidTertinggi = ticket.bids?.[0];
  const encodedPath = encodeURI(ticket.user?.image || "");
  const imageUrl = encodedPath.startsWith("/uploads/")
    ? encodedPath
    : "/images/default-avatar.png";

  return (
    <main className="p-6">
      {typeof timeLeft === "number" && (
        <div className="text-center text-sm font-semibold text-red-500">
          ⏳ Sisa waktu lelang: {formatCountdown(timeLeft)}
        </div>
      )}
      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Card className="p-0 overflow-hidden h-full">
            <img
              src={ticket.konser.image || "/dummy-konser.jpg"}
              alt="Gambar konser"
              className="w-full h-200 object-cover"
            />
            <div className="p-4 space-y-2">
              <a
                href={`/konser/${ticket.konser.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-black hover:text-green-600"
              >
                🎤 {ticket.konser.nama}
              </a>

              <p className="text-sm text-muted-foreground text-right">
                📅 {new Date(ticket.konser.tanggal).toLocaleDateString()}
                <br />
                📍 {ticket.konser.venue}, {ticket.konser.lokasi}
              </p>
              <Separator />
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {ticket.tipeTempat === "Duduk" ? "🪑 Duduk" : "💃🏼 Berdiri"}
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  💺 Seat: {ticket.seat ?? "Bebas"}
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  🎟️ {ticket.jumlah} Tiket
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  🎟️ {ticket.kategori.nama}
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  🎟️ {ticket.sebelahan ? "Sebelahan 👫" : "Terpisah 👋"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground ">
                <span className="font-semibold">{ticket.deskripsi} </span>
              </p>
              <Card className="flex items-stretch overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Foto Penjual"
                  className="max-h-20 w-20 object-cover rounded-l-xl"
                />
                <div className="flex-1 p-4 space-y-1">
                  <a
                    href={`/username/${ticket.user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-black hover:text-green-600"
                  >
                    @{ticket.user.username}
                  </a>

                  <div className="text-sm text-muted-foreground">
                    Sejak{" "}
                    {new Date(ticket.user.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </div>
                </div>
                <div className="p-4 text-right">
                  <div className="text-xl font-bold text-green-600">
                    📈 {penjualTerjual}
                  </div>
                  <div className="text-xs text-muted-foreground">Terjual</div>
                </div>
              </Card>
              <p className="text-xs text-muted-foreground text-center">
                🔥Gk sabar? mau beli langsung?👇
              </p>
              <div className="flex gap-2 pt-3">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  onClick={handleBuy}
                  disabled={isLoadingBuy}
                >
                  {isLoadingBuy ? (
                    "Loading..."
                  ) : (
                    <div className="text-xs leading-tight text-center">
                      Beli Langsung
                      <br />
                      <span className="text-sm font-bold">
                        {formatHarga(ticket.harga_beli)}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-4 h-full min-h-[500px] flex flex-col justify-between">
            {estimasiBidTertinggi && (
              <div className="text-sm font-medium text-green-600">
                💰 Estimasi total bid tertinggi:{" "}
                {formatHarga(estimasiBidTertinggi.totalBayar)}
              </div>
            )}
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
                    className={cn(
                      "flex justify-between text-sm border-b last:border-none pb-1",
                      i === 0 && "font-bold text-green-600"
                    )}
                  >
                    <span>💰 {formatHarga(bid.amount)}</span>
                    <span className="text-muted-foreground">
                      {bid.user?.username ?? "anonim"} • {/* waktu */}
                      {(() => {
                        const tgl = new Date(bid.createdAt);
                        return `${tgl.getDate()}/${
                          tgl.getMonth() + 1
                        } ${tgl.getHours()}:${String(tgl.getMinutes()).padStart(
                          2,
                          "0"
                        )}`;
                      })()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-sm text-muted-foreground">
                <p>🏁 Harga Awal: {formatHarga(ticket.harga_awal)}</p>
                <p>💸 Kelipatan: {formatHarga(ticket.kelipatan)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-black bg-gray-200"
                  onClick={() =>
                    setBidAmount((prev) =>
                      Math.max(prev - ticket.kelipatan, ticket.harga_awal)
                    )
                  }
                  disabled={bidAmount <= ticket.harga_awal}
                >
                  -
                </Button>
                <input
                  type="text"
                  value={formatHarga(bidAmount)}
                  onChange={(e) =>
                    setBidAmount(Number(e.target.value.replace(/\D/g, "")))
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  className="border px-4 py-2 rounded w-full text-center bg-background text-foreground"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-black bg-gray-200"
                  onClick={() =>
                    setBidAmount((prev) => prev + ticket.kelipatan)
                  }
                >
                  +
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                💡 Harga per tiket (estimasi):{" "}
                {estimasiUserBid
                  ? formatHarga(estimasiUserBid.hargaPerTiket)
                  : "-"}
              </div>
              <div className="text-sm font-medium">
                💰 Estimasi total bayar:{" "}
                {estimasiUserBid
                  ? formatHarga(estimasiUserBid.totalBayar)
                  : "-"}
                <p className="text-xs text-muted-foreground">
                  *Udah all-in gengs! Termasuk 3% platform + fee transfer 😎
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBid}
                  disabled={isLoadingBid}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  {isLoadingBid ? "Loading..." : "Bid Sekarang"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <CommentSection
            itemId={ticket.id}
            itemType="ticket"
            sellerId={ticket.user.id}
          />
        </div>
      </div>
    </main>
  );
}
