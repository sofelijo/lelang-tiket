"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";   



export default function SnapStatusPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");
  const [pembayaranId, setPembayaranId] = useState<string | null>(null);

  useEffect(() => {
    const statusMidtrans = params.get("transaction_status");
    const id = params.get("order_id")?.split("-")[2] || null; // Ambil ID dari format: JL-xxx-<id>-...
    setPembayaranId(id);

    if (!statusMidtrans) {
      setStatus("failed");
      return;
    }

    if (statusMidtrans === "settlement" || statusMidtrans === "capture") {
      setStatus("success");
    } else if (statusMidtrans === "pending") {
      setStatus("pending");
    } else {
      setStatus("failed");
    }
  }, [params]);

  const linkKembali = pembayaranId
    ? `/pembayaran/${pembayaranId}`
    : "/profile/pesanan";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Lagi dicek nih... bentar ya 🤖
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-bold text-green-600">Pembayaran Sukses 🎉</h2>
            <p className="text-muted-foreground">
              Makasih yaa! Pembayaran kamu udah sukses. Admin akan proses tiket kamu segera 💃
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={linkKembali}
                className="inline-block bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
              >
                🔙 Kembali ke Halaman Pembayaran
              </Link>
              <Link
                href="/"
                className="inline-block text-sm text-muted-foreground underline"
              >
                Balik ke Beranda
              </Link>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <h2 className="text-xl font-bold text-yellow-600">Menunggu Pembayaran 🕐</h2>
            <p className="text-muted-foreground">
              Transaksi kamu masih nunggu, jangan lupa segera bayar yaa biar gak expired 😬
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={linkKembali}
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                🔙 Cek Halaman Pembayaran
              </Link>
              <Link
                href="/"
                className="inline-block text-sm text-muted-foreground underline"
              >
                Balik ke Beranda
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Transaksi Gagal 💔</h2>
            <p className="text-muted-foreground">
              Waduh... kayaknya transaksi kamu gagal. Coba lagi ya atau hubungi admin!
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={linkKembali}
                className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🔁 Coba Lagi
              </Link>
              <Link
                href="/"
                className="inline-block text-sm text-muted-foreground underline"
              >
                Balik ke Beranda
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
