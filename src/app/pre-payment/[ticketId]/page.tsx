// app/pre-payment/[ticketId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function PrePaymentPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = typeof params?.["ticketId"] === "string" ? params.ticketId : "";

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metode, setMetode] = useState<"TRANSFER" | "QRIS_DINAMIS" | "CREDIT_CARD" | "CSTORE">("TRANSFER");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/ticket/${ticketId}`);
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        console.error("Gagal ambil data tiket", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  const feePlatform = ticket ? Math.max(Math.ceil(ticket.harga_beli * 0.03), 27000) : 0;
  const feeMetode = metode === "QRIS_DINAMIS"
    ? Math.ceil(ticket?.harga_beli * 0.01)
    : metode === "CREDIT_CARD"
    ? Math.ceil(ticket?.harga_beli * 0.05) + 5000
    : 10000;

  const totalBayar = (ticket?.harga_beli || 0) + feePlatform + feeMetode + 111; // kodeUnik dummy

  const handleLanjutBayar = async () => {
    if (!ticketId) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/pembayaran/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, metodePembayaran: metode }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/pembayaran/${data.id}`);
      } else {
        alert("Gagal membuat pembayaran");
      }
    } catch (err) {
      console.error("❌ Error create pembayaran:", err);
      alert("Terjadi kesalahan saat proses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin w-6 h-6" /> Loading tiket...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">Cek & Pilih Pembayaran</h2>

        <div className="text-sm space-y-1">
          <div>🎤 Konser: {ticket.konser?.nama}</div>
          <div>📅 Tanggal: {new Date(ticket.konser?.tanggal).toLocaleDateString("id-ID")}</div>
          <div>🪑 Tempat: {ticket.tipeTempat} ({ticket.seat})</div>
          <div>🎫 Harga Tiket: {formatRupiah(ticket.harga_beli)}</div>
          <div>📦 Fee Platform: {formatRupiah(feePlatform)}</div>
          <div>💳 Fee Payment: {formatRupiah(feeMetode)}</div>
          <div>💰 Estimasi Total: {formatRupiah(totalBayar)}</div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <Button variant={metode === "TRANSFER" ? "default" : "outline"} onClick={() => setMetode("TRANSFER")}>Transfer Bank (3%)</Button>
          <Button variant={metode === "QRIS_DINAMIS" ? "default" : "outline"} onClick={() => setMetode("QRIS_DINAMIS")}>QRIS (4%)</Button>
          <Button variant={metode === "CREDIT_CARD" ? "default" : "outline"} onClick={() => setMetode("CREDIT_CARD")}>Kartu Kredit (5%)</Button>
          <Button variant={metode === "CSTORE" ? "default" : "outline"} onClick={() => setMetode("CSTORE")}>Alfamart/Indomaret (3%)</Button>
        </div>

        <Button disabled={isProcessing} className="w-full mt-2" onClick={handleLanjutBayar}>
          {isProcessing ? <span className="flex gap-2 items-center"><Loader2 className="animate-spin w-4 h-4" /> Memproses...</span> : "Lanjut ke Pembayaran"}
        </Button>
      </Card>
    </div>
  );
}
