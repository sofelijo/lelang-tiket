"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
//import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const getFeeLabel = () => {
    switch (metode) {
      case "qris":
        return "QRIS (3%)";
      case "credit_card":
        return "Card (5%)";
      case "cstore":
        return "Retail (0%)";
      default:
        return "Transfer Bank (0%)";
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={1} />
      <Separator className="my-4" />

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">1. Pilih Metode Pembayaran</h2>

        {ticketInfo && (
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-green-700">
              🎤 {ticketInfo.konser?.nama}
            </h3>
            <p className="text-sm text-muted-foreground">
              🎟️ {ticketInfo.kategori?.nama} • 🧾 {ticketInfo.jumlah} Tiket
            </p>
          </div>
        )}

        <div className="text-sm space-y-1 pt-2">
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
                <span>
                  📦 Fee Platform:{" "}
                  <span className="text-xs italic text-muted-foreground">
                    (3% / min. 13k)
                  </span>
                </span>
                <span>{formatRupiah(estimasi.feePlatform)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  💳 Fee Payment:{" "}
                  <span className="text-xs italic text-muted-foreground">
                    {getFeeLabel()}
                  </span>
                </span>
                <span>{formatRupiah(estimasi.feeMetode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  🧾 Fee Transaksi{" "}
                  <span className="text-xs italic text-muted-foreground">
                    (Flat)
                  </span>
                </span>
                <span>{formatRupiah(estimasi.feeTransaksi)}</span>
              </div>
              <p className="text-xs text-muted-foreground italic -mt-1 mb-2">
                *Fee transaksi & payment tidak bisa direfund
              </p>

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

        {/* Logo Support */}
        {/* Logo Support */}
        {/* Logo Support */}

        <div className="mt-6">
          <p className="text-sm font-semibold text-center mb-3 text-muted-foreground">
            Metode pembayaran yang didukung
          </p>

          <Card className="p-0 rounded-xl border border-muted bg-white shadow-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-muted/10">
              {/* Bank Transfer */}
              <CardContent
                onClick={() => setMetode("bank_transfer")}
                className={`py-1.5 px-2 flex flex-col items-center justify-center cursor-pointer 
          rounded-md transition-all duration-200 ${
            metode === "bank_transfer" ? "ring-2 ring-primary bg-muted/20" : ""
          }`}
              >
                <span className="text-sm font-medium text-gray-700 mb-1">
                  Bank
                </span>
                <img
                  src="/img/payment/bank.png"
                  alt="Bank"
                  className="h-[72px] w-full object-contain"
                />
              </CardContent>

              {/* QRIS */}
              <CardContent
                onClick={() => setMetode("qris")}
                className={`py-1.5 px-2 flex flex-col items-center justify-center cursor-pointer 
          rounded-md transition-all duration-200 ${
            metode === "qris" ? "ring-2 ring-primary bg-muted/20" : ""
          }`}
              >
                <span className="text-sm font-medium text-gray-700 mb-1">
                  QRIS
                </span>
                <img
                  src="/img/payment/qris.png"
                  alt="QRIS"
                  className="h-[72px] w-full object-contain"
                />
              </CardContent>

              {/* Kartu Kredit */}
              <CardContent
                onClick={() => setMetode("credit_card")}
                className={`py-1.5 px-2 flex flex-col items-center justify-center cursor-pointer 
          rounded-md transition-all duration-200 ${
            metode === "credit_card" ? "ring-2 ring-primary bg-muted/20" : ""
          }`}
              >
                <span className="text-sm font-medium text-gray-700 mb-1">
                  Card
                </span>
                <img
                  src="/img/payment/card.png"
                  alt="Card"
                  className="h-[72px] w-full object-contain"
                />
              </CardContent>

              {/* Retail */}
              <CardContent
                onClick={() => setMetode("cstore")}
                className={`py-1.5 px-2 flex flex-col items-center justify-center cursor-pointer 
          rounded-md transition-all duration-200 ${
            metode === "cstore" ? "ring-2 ring-primary bg-muted/20" : ""
          }`}
              >
                <span className="text-sm font-medium text-gray-700 mb-1">
                  Retail
                </span>
                <img
                  src="/img/payment/retail.png"
                  alt="Retail"
                  className="h-[72px] w-full object-contain"
                />
              </CardContent>
            </div>
          </Card>
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
              {m === "bank_transfer" && "Bank"}
              {m === "qris" && "QRIS"}
              {m === "credit_card" && "Card"}
              {m === "cstore" && "Retail"}
              {termurah.includes(m) && (
                <span className="ml-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Termurah
                </span>
              )}
            </Button>
          ))}
        </div>

        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogTrigger asChild>
            <Button
              className="w-full mt-4"
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
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">
                Yakin mau lanjut bayar?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-sm text-muted-foreground">
                ⏳ Kamu cuma punya waktu{" "}
                <strong className="text-red-600">10 menit</strong>
                buat selesain pembayaran. Kalau lewat, pembayaran bakal{" "}
                <strong>hangus otomatis</strong>.
                <br />
                Yuk langsung gas sekarang sebelum keambil orang lain 😱
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="text-black hover:text-black">
                Batal
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleLanjutBayar}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Gas Bayar Sekarang
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
