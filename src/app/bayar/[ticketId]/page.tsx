"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import { Loader2 } from "lucide-react";

export default function BayarStep1Page() {
  const router = useRouter();
  const params = useParams();
  const ticketId =
    typeof params?.["ticketId"] === "string" ? params["ticketId"] : "";

  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [metode, setMetode] = useState<
    "bank_transfer" | "qris" | "credit_card" | "cstore"
  >("bank_transfer");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/ticket/${ticketId}`);
        const data = await res.json();
        setTicketInfo(data);
      } catch (error) {
        console.error("Gagal fetch ticket", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(n);

  const feePlatform = ticketInfo
    ? Math.max(Math.ceil(ticketInfo.harga_beli * 0.03), 27000)
    : 0;
  const feeMetode =
    metode === "qris"
      ? Math.ceil(ticketInfo?.harga_beli * 0.01)
      : metode === "credit_card"
      ? Math.ceil(ticketInfo?.harga_beli * 0.05) + 5000
      : 10000;
  const kodeUnik = 999; // dummy dulu
  const totalBayar =
    (ticketInfo?.harga_beli || 0) + feePlatform + feeMetode + kodeUnik;

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
      console.log("📦 Data Pembayaran dari Backend:", data);
      if (!res.ok) throw new Error(data.message || "Gagal membuat pembayaran");

      router.push(`/pembayaran/${data.id}`);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={1} />
      <Separator className="my-4" />

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">1. Pilih Metode Pembayaran</h2>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>🎫 Harga Tiket:</span>
            <span>{formatRupiah(ticketInfo?.harga_beli)}</span>
          </div>
          <div className="flex justify-between">
            <span>📦 Fee Platform:</span>
            <span>{formatRupiah(feePlatform)}</span>
          </div>
          <div className="flex justify-between">
            <span>💳 Fee Payment:</span>
            <span>{formatRupiah(feeMetode)}</span>
          </div>
          <div className="flex justify-between">
            <span>🔢 Kode Unik:</span>
            <span>{kodeUnik}</span>
          </div>
          <div className="text-xs text-muted-foreground italic pl-4">
            *tidak bisa di refund
          </div>

          <div className="flex justify-between font-bold">
            <span>💰 Total Bayar:</span>
            <span>{formatRupiah(totalBayar)}</span>
          </div>
        </div>

        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={metode === "bank_transfer" ? "default" : "outline"}
            onClick={() => setMetode("bank_transfer")}
          >
            Transfer Bank
          </Button>
          <Button
            variant={metode === "qris" ? "default" : "outline"}
            onClick={() => setMetode("qris")}
          >
            QRIS
          </Button>
          <Button
            variant={metode === "credit_card" ? "default" : "outline"}
            onClick={() => setMetode("credit_card")}
          >
            Kartu Kredit
          </Button>
          <Button
            variant={metode === "cstore" ? "default" : "outline"}
            onClick={() => setMetode("cstore")}
          >
            Alfamart/Indomaret
          </Button>
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleLanjutBayar}
          disabled={isProcessing}
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
