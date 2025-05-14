"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";


export default function PembayaranPage() {
  const { pembayaranId } = useParams() as { pembayaranId: string };
  const router = useRouter();

  const [pembayaran, setPembayaran] = useState<any>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [isBlinking, setIsBlinking] = useState(false);

  const formatRupiah = (n: number | string | null | undefined) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(n) || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pembayaran/${pembayaranId}`);
        const data = await res.json();
        setPembayaran(data);

        if (!data.snapToken) {
          const snapRes = await fetch("/api/payment/midtrans/snap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pembayaranId: data.id,
              metode: data.snapMethod,
            }),
          });
          const snapData = await snapRes.json();
          if (snapData.token) {
            setSnapToken(snapData.token);
            const refreshed = await fetch(`/api/pembayaran/${pembayaranId}`);
            const refreshedData = await refreshed.json();
            setPembayaran(refreshedData);
          }
        } else {
          setSnapToken(data.snapToken);
        }

        setTimeout(() => {
          setShowContent(true);
        }, 5000);
      } catch (err) {
        console.error("❌ Gagal mengambil pembayaran", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pembayaranId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skipRedirect = params.get("skipAutoRedirect");

    if (
      pembayaran?.statusPembayaran === "BERHASIL" &&
      skipRedirect !== "true"
    ) {
      setTimeout(() => {
        router.push(`/pembayaran/${pembayaranId}/konfirmasi`);
      }, 2000);
    }
  }, [pembayaran?.statusPembayaran, pembayaranId, router]);

  useEffect(() => {
    if (!pembayaran?.qrisExpiredAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expireTime = new Date(pembayaran.qrisExpiredAt).getTime();
      const diff = expireTime - now;

      if (diff <= 0) {
        setCountdown("00:00");
        setIsBlinking(false);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdown(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`
        );
        setIsBlinking(minutes < 10);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pembayaran?.qrisExpiredAt]);

  useEffect(() => {
    if (
      showContent &&
      snapToken &&
      scriptLoaded &&
      typeof window !== "undefined" &&
      (window as any).snap &&
      document.getElementById("midtrans-container")
    ) {
      (window as any).snap.embed(snapToken, {
        embedId: "midtrans-container",
        onSuccess: (result: any) => {
          router.push(`/pembayaran/${pembayaranId}/konfirmasi`);
        },
        onPending: (result: any) => console.log("⏳ pending", result),
        onError: (result: any) => console.error("❌ error", result),
        onClose: () => console.log("❎ popup closed"),
      });
    }
  }, [showContent, snapToken, scriptLoaded]);

  if (loading || !pembayaran || !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Menyiapkan pembayaran, mohon tunggu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={2} />
      <Separator className="my-4" />

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">2. Pembayaran</h2>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>🎫 Harga Tiket:</span>
            <span>{formatRupiah(pembayaran.hargaTiket)}</span>
          </div>
          <div className="flex justify-between">
            <span>📦 Fee Platform:</span>
            <span>{formatRupiah(pembayaran.feePlatform)}</span>
          </div>
          <div className="flex justify-between">
            <span>💳 Fee Payment (Persen):</span>
            <span>{formatRupiah(pembayaran.feeMetode)}</span>
          </div>
          <div className="flex justify-between">
            <span>🧾 Fee Transaksi (Flat):</span>
            <span>{formatRupiah(pembayaran.feeMetodeFlat)}</span>
          </div>
          <div className="flex justify-between">
            <span>🔢 Kode Unik:</span>
            <span>{pembayaran.kodeUnik}</span>
          </div>
          <div className="flex justify-between font-bold">  
            <span>💰 Total Bayar:</span>
            <span>{formatRupiah(pembayaran.jumlahTotal)}</span>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground mb-1">
              ⏳ Waktu pembayaran tersisa
            </p>
            <div
              className={cn(
                "text-xl font-bold tracking-widest text-red-600",
                isBlinking && "animate-blink-fast"
              )}
            >
              {countdown}
            </div>
          </div>
        </div>

        <div id="midtrans-container" className="mt-4 w-full min-h-[300px]" />

        <Script
          id="midtrans-script"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          onLoad={() => setScriptLoaded(true)}
        />
      </Card>
    </div>
  );
}
