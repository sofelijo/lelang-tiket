"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SnapStatusPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");

  useEffect(() => {
    const statusMidtrans = params.get("transaction_status");

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
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Balik ke Beranda
            </Link>
          </>
        )}

        {status === "pending" && (
          <>
            <h2 className="text-xl font-bold text-yellow-600">Menunggu Pembayaran 🕐</h2>
            <p className="text-muted-foreground">
              Transaksi kamu masih nunggu, jangan lupa segera bayar yaa biar gak expired 😬
            </p>
            <Link
              href="/"
              className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Balik ke Beranda
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Transaksi Gagal 💔</h2>
            <p className="text-muted-foreground">
              Waduh... kayaknya transaksi kamu gagal. Coba lagi ya atau hubungi admin!
            </p>
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
