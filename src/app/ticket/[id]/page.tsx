"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommentSection from "@/app/components/CommentSection";
import { Ticket } from "@/lib/types";

// 🍼 Tambahan ini buat label status yang lucu
const statusLabels: Record<"PENDING" | "BERLANGSUNG" | "SELESAI", string> = {
  PENDING: "Belum mulai",
  BERLANGSUNG: "Lagi rameee",
  SELESAI: "Udah bubar",
};

export default function TicketDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id ?? "";

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/ticket/${id}`);
      if (!res.ok) throw new Error("Gagal ambil data tiket");
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError("Data tiket tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!ticket) return;

    const bidAmount = parseInt(amount);
    if (isNaN(bidAmount) || bidAmount <= ticket.harga_awal) {
      setMessage({
        type: "error",
        text: "Penawaran harus lebih tinggi dari harga awal",
      });
      return;
    }

    const res = await fetch("/api/bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: ticket.id, amount: bidAmount }),
    });
    const data = await res.json();

    if (res.ok) {
      await fetchTicket(); // Refetch data tiket setelah bid
      setAmount("");
      setMessage({ type: "success", text: "Penawaran berhasil dikirim!" });
    } else {
      setMessage({ type: "error", text: data.message || "Gagal menawar" });
    }
  };

  const handleBuyNow = async () => {
    if (!ticket?.harga_beli) return;

    setIsBuying(true);
    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchTicket();
        setMessage({ type: "success", text: "Tiket berhasil dibeli!" });
      } else {
        setMessage({ type: "error", text: data.message || "Gagal membeli tiket" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat membeli tiket" });
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-300">⏳ Loading tiket...</div>;
  if (error || !ticket)
    return <div className="p-8 text-center text-red-400">{error}</div>;

  const statusColor = {
    PENDING: "text-yellow-400",
    BERLANGSUNG: "text-green-400",
    SELESAI: "text-red-400",
  }[ticket.statusLelang] || "text-white";

  return (
    <div className="p-6 md:p-12 text-white bg-gradient-to-b from-black to-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Detail Tiket */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {ticket.konser.nama} - {ticket.kategori.nama}
          </h1>
          <div className="text-gray-400">{ticket.konser.lokasi} | {new Date(ticket.konser.tanggal).toLocaleDateString()}</div>
          <div className="flex flex-wrap gap-4 mt-4">
            <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">💺 Seat: {ticket.seat ?? "Bebas"}</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">🏟️ Tempat: {ticket.tipeTempat}</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">🎟️ Jumlah: {ticket.jumlah}</span>
          </div>
          <p className="text-lg">
            💰 <span className="font-semibold">Harga Awal:</span> Rp{ticket.harga_awal.toLocaleString()}
          </p>
          {ticket.harga_beli && (
            <p className="text-lg">
              🛒 <span className="font-semibold">Harga Beli Langsung:</span> Rp{ticket.harga_beli.toLocaleString()}
            </p>
          )}
          <p className="text-lg">⏰ Batas Waktu: {new Date(ticket.batas_waktu).toLocaleString()}</p>
          {ticket.deskripsi && (
            <p className="text-gray-300 italic mt-2">📝 {ticket.deskripsi}</p>
          )}
          <p className="mt-4 font-semibold">
            Status Lelang: <span className={`${statusColor} font-bold`}>{statusLabels[ticket.statusLelang]}</span>
          </p>
        </div>

        {/* Form Penawaran */}
        {ticket.statusLelang === "BERLANGSUNG" && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
            <form onSubmit={handleBid} className="space-y-4">
              <label className="block font-semibold">Tawar Harga</label>
              <input
                type="number"
                min={ticket.harga_awal + 1}
                className="p-3 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan tawaran Anda"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-lg font-bold text-lg"
              >
                🚀 Kirim Tawaran
              </button>
            </form>

            {ticket.harga_beli && (
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-lg font-bold text-lg"
                onClick={handleBuyNow}
                disabled={isBuying}
              >
                🛒 {isBuying ? "Memproses..." : "Beli Langsung"}
              </button>
            )}

            {message && (
              <p
                className={`mt-4 font-semibold ${
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* Riwayat Penawaran */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold mb-4">📈 Riwayat Penawaran</h2>
          {ticket.bids.length === 0 ? (
            <p className="text-gray-400">Belum ada penawaran.</p>
          ) : (
            <ul className="space-y-3">
              {ticket.bids.map((bid, i) => (
                <li key={i} className="p-4 bg-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold">💰 Rp{bid.amount.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">👤 {bid.user?.name ?? "Anonim"}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    🕒 {new Date(bid.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Komentar */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold mb-4">💬 Komentar</h2>
          <CommentSection itemId={String(ticket.id)} itemType="ticket" />
        </div>
      </div>
    </div>
  );
}
