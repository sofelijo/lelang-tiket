"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommentSection from '@/app/components/CommentSection';
import { Ticket } from "@/lib/types";

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

  useEffect(() => {
    if (!id) return;

    fetch(`/api/ticket/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal ambil data tiket");
        return res.json();
      })
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("Data tiket tidak ditemukan.");
        setLoading(false);
      });
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
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              bids: [{ ...data, user: data.user }, ...prev.bids],
            }
          : prev
      );
      setAmount("");
      setMessage({ type: "success", text: "Penawaran berhasil dikirim!" });
    } else {
      setMessage({ type: "error", text: data.message || "Gagal menawar" });
    }
  };

  if (loading) return <p className="text-white p-4">Loading...</p>;
  if (error || !ticket)
    return <p className="text-red-500 p-4">Data tiket tidak ditemukan.</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        {ticket.konser.nama} - {ticket.kategori.nama}
      </h1>
      <p className="mb-2">Tempat: {ticket.konser.tempat}</p>
      <p className="mb-2">Tanggal: {ticket.konser.tanggal}</p>
      <p className="mb-4">
        Harga Awal: Rp{ticket.harga_awal.toLocaleString()}
      </p>

      <form onSubmit={handleBid} className="mb-6">
        <label className="block mb-2">Tawar Harga</label>
        <input
          type="number"
          className="p-2 rounded bg-gray-700 text-white w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          type="submit"
        >
          Tawar Sekarang
        </button>
      </form>

      {message && (
        <p
          className={`mb-4 font-semibold ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <h2 className="text-xl font-semibold mb-2">Riwayat Penawaran</h2>
      {ticket.bids.length === 0 ? (
        <p>Belum ada penawaran.</p>
      ) : (
        <ul className="space-y-2">
          {ticket.bids.map((bid, i) => (
            <li key={i} className="p-2 bg-gray-800 rounded">
              <div>💰 Rp{bid.amount}</div>
              <div>👤 {bid.user?.name ?? "Pengguna"}</div>
              <div className="text-sm text-gray-400">
                🕒 {new Date(bid.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      <CommentSection itemId={String(ticket.id)} itemType="ticket" />
    </div>
  );
}
