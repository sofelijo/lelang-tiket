"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import CommentSection from "@/app/components/lainnya/CommentSection";
import { toast } from "sonner";

export default function DetailTiketPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [estimasiBidTertinggi, setEstimasiBidTertinggi] = useState<any>(null);
  const [estimasiUserBid, setEstimasiUserBid] = useState<any>(null);
  const [isLoadingBid, setIsLoadingBid] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session:", session);
  }, [session]);

  useEffect(() => {
    console.log("Ticket:", ticket);
  }, [ticket]);

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
    if (!ticket?.batas_waktu || ticket?.kelipatan === null) return;
    const interval = setInterval(() => {
      const selisih = Math.floor(
        (new Date(ticket.batas_waktu).getTime() - Date.now()) / 1000
      );
      setTimeLeft(Math.max(selisih, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [ticket]);

  useEffect(() => {
    if (ticket && ticket.kelipatan !== null) {
      const lastBid = ticket.bids?.[0]?.amount ?? null;
      const min = lastBid ? lastBid + ticket.kelipatan : ticket.harga_awal;
      setBidAmount(min);

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
    if (!ticket || ticket.kelipatan === null || !bidAmount) return;
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
      toast.error("💸 Bid harus lebih tinggi dari harga awal yaa");
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
        toast.success(
          `🎯 Bid berhasil dikirim: ${formatHarga(bidAmount)} udah masuk gais!`
        );
        const updated = await fetch(`/api/ticket/${id}`);
        const refreshed = await updated.json();
        setTicket(refreshed);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Gagal bid, coba lagi yaa");
      }
    } catch (err: any) {
      toast.error(`❌ Gagal bid: ${err.message} - Wajib login`);
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
    <main className="pt-0 px-0">
      {ticket.kelipatan !== null && typeof timeLeft === "number" && (
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

              {ticket.statusLelang !== "SELESAI" && (
                <>
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
                </>
              )}
            </div>
          </Card>
        </div>
        {ticket.kelipatan !== null && (
          <div className="space-y-4">
            <Card className="p-4 space-y-4 h-full min-h-[500px] flex flex-col justify-between">
              {estimasiBidTertinggi && (
                <Alert className="bg-green-50 border-green-200 text-green-800 px-3 py-2 text-sm text-center">
                  ⚠️ Estimasi total bayar bid tertinggi: <br></br>
                  <span className="font-bold text-green-700 ml-1">
                    {formatHarga(estimasiBidTertinggi.totalBayar)}
                  </span>
                </Alert>
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
                        i === 0 && " text-green-600"
                      )}
                    >
                      <span>
                        {" "}
                        {i === 0 ? "👑" : "💰"}{" "}
                        <span className={i === 0 ? "font-bold" : ""}>
                          {formatHarga(bid.amount)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {bid.user?.username ?? "anonim"} • {/* waktu */}
                        {(() => {
                          const tgl = new Date(bid.createdAt);
                          return `${tgl.getDate()}/${
                            tgl.getMonth() + 1
                          } ${tgl.getHours()}:${String(
                            tgl.getMinutes()
                          ).padStart(2, "0")}`;
                        })()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {ticket.statusLelang === "SELESAI" ? (
                <>
                  <Alert className="bg-green-50 border-green-200 text-green-800 px-0 py-0 flex overflow-hidden rounded-xl shadow">
                    <div className="w-20 h-20 bg-white flex items-center justify-center border-r border-green-200">
                      <img
                        src={
                          ticket.pemenang?.image?.startsWith("/uploads/")
                            ? ticket.pemenang.image
                            : "/images/default-avatar.png"
                        }
                        alt="Foto Pemenang"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 px-4 py-2">
                      <p className="text-sm font-semibold mb-1">
                        🏁 Lelang udah kelar gengs!
                      </p>
                      <p className="text-xs mt-1 text-muted-foreground">
                      Congratz buat sang pemenang!{" "}<br></br>
                        <span className="font-bold text-primary">
                          @{ticket.pemenang?.username ?? "(anonim)"}
                        </span>{" "}
                        🎉
                      </p>
                     
                    </div>
                  </Alert>

                  <div className="flex flex-col items-center gap-2 mt-4">
                    {Number(session?.user?.id) === ticket.pemenangId && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white mt-3 w-full text-center"
                        onClick={() => router.push(`/bayar/${ticket.id}`)}
                      >
                        💸 Bayar Sekarang
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Riwayat Bid */}

                  {/* Input Bid dan Estimasi */}
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
                        disabled={
                          !ticket.harga_awal ||
                          bidAmount <=
                            (ticket.bids?.[0]?.amount ?? ticket.harga_awal)
                        }
                      >
                        -
                      </Button>

                      <input
                        type="text"
                        value={formatHarga(bidAmount)}
                        onChange={(e) =>
                          setBidAmount(
                            Number(e.target.value.replace(/\D/g, ""))
                          )
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
                      {estimasiUserBid ? (
                        <span className="text-green-600 font-bold">
                          {formatHarga(estimasiUserBid.totalBayar)}
                        </span>
                      ) : (
                        "-"
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        *Udah all-in gengs! Termasuk 3% fee platform + transkasi
                        😎
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
                </>
              )}
            </Card>
          </div>
        )}
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
