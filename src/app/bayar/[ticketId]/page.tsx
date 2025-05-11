"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const FEE_METODE: Record<string, { persen: number; tetap: number }> = {
  qris: { persen: 0.01, tetap: 2000 },
  credit_card: { persen: 0.05, tetap: 5000 },
  bank_transfer: { persen: 0, tetap: 10000 },
  cstore: { persen: 0, tetap: 10000 },
};

export default function BayarStep1Page() {
  const router = useRouter();
  const params = useParams();
  const ticketId =
    typeof params?.["ticketId"] === "string" ? params["ticketId"] : "";

  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [metode, setMetode] = useState<
    "bank_transfer" | "qris" | "credit_card" | "cstore"
  >("bank_transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimasi, setEstimasi] = useState<any>(null);
  const [termurah, setTermurah] = useState<string[]>([]);
  const [isEstimating, setIsEstimating] = useState(true);

  const formatRupiah = (n: number | string | null | undefined) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(n) || 0);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/ticket/${ticketId}`);
        const data = await res.json();
        setTicketInfo(data);
      } catch (err) {
        console.error("❌ Gagal fetch tiket", err);
      }
    };
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    const fetchEstimasi = async () => {
      setIsEstimating(true);
      try {
        const res = await fetch(
          `/api/pembayaran/estimasi?ticketId=${ticketId}&metode=${metode}`
        );
        const data = await res.json();
        setEstimasi(data);

        const resTermurah = await fetch(
          `/api/pembayaran/estimasi?mode=termurah-all&ticketId=${ticketId}`
        );
        const dataTermurah = await resTermurah.json();
        const metodeTermurah = Array.isArray(dataTermurah)
          ? dataTermurah
              .filter((d: any) => d.ticketId === Number(ticketId))
              .map((d: any) => d.metode)
          : [];
        setTermurah(metodeTermurah);
      } catch (err) {
        console.error("❌ Gagal fetch estimasi", err);
      } finally {
        setIsEstimating(false);
      }
    };

    if (ticketId && metode) {
      fetchEstimasi();
    }
  }, [ticketId, metode]);

  const handleLanjutBayar = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/pembayaran/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticketInfo.id,
          metodePembayaran: metode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat pembayaran");
      router.push(`/pembayaran/${data.id}`);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={1} />
      <Separator className="my-4" />

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">1. Pilih Metode Pembayaran</h2>

        <div className="text-sm space-y-1">
          {isEstimating || !estimasi ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span>🎫 Harga Tiket:</span>
                <span>{formatRupiah(estimasi.hargaTiket)}</span>
              </div>
              <div className="flex justify-between">
                <span>📦 Fee Platform:</span>
                <span>{formatRupiah(estimasi.feePlatform)}</span>
              </div>
              <div className="flex justify-between">
                <span>💳 Fee Payment (Persen):</span>
                <span>{formatRupiah(estimasi.feeMetode)}</span>
              </div>
              <div className="flex justify-between">
                <span>🧾 Fee Transaksi (Flat):</span>
                <span>{formatRupiah(estimasi.feeTransaksi)}</span>
              </div>
              <div className="flex justify-between">
                <span>🔢 Kode Unik:</span>
                <span>{estimasi.kodeUnik}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>💰 Total Bayar:</span>
                <span>{formatRupiah(estimasi.totalBayar)}</span>
              </div>
            </>
          )}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-2">
          {["bank_transfer", "qris", "credit_card", "cstore"].map((m) => (
            <Button
              key={m}
              variant={metode === m ? "default" : "outline"}
              onClick={() => setMetode(m as any)}
              disabled={isProcessing || isEstimating}
            >
              {m === "bank_transfer" && "Transfer Bank"}
              {m === "qris" && "QRIS"}
              {m === "credit_card" && "Kartu Kredit"}
              {m === "cstore" && "Alfamart/Indomaret"}
              {termurah.includes(m) && (
                <span className="ml-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Termurah
                </span>
              )}
            </Button>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleLanjutBayar}
          disabled={isProcessing || isEstimating}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
            </span>
          ) : (
            "Bayar Sekarang"
          )}
        </Button>
      </Card>
    </div>
  );
}
