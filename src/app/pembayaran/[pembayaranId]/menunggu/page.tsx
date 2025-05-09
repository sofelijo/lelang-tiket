"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stepper } from "@/components/payment/Stepper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function MenungguPage() {
  const { pembayaranId } = useParams() as { pembayaranId: string };
  const router = useRouter();

  const [pembayaran, setPembayaran] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pembayaran/${pembayaranId}`);
        const data = await res.json();

        if (!data || data.statusPembayaran !== "BERHASIL") {
          router.push(`/pembayaran/${pembayaranId}`);
          return;
        }

        setPembayaran(data);
      } catch (err) {
        console.error("❌ Gagal ambil data pembayaran", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pembayaranId, router]);

  // Hitung countdown 3x24 jam dari createdAt
  useEffect(() => {
    if (!pembayaran?.createdAt) return;

    const interval = setInterval(() => {
      const expireAt = new Date(pembayaran.createdAt);
      expireAt.setHours(expireAt.getHours() + 72); // 3x24 jam

      const now = new Date();
      const selisih = Math.floor((expireAt.getTime() - now.getTime()) / 1000);
      setTimeLeft(Math.max(selisih, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [pembayaran]);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const d = Math.floor(h / 24);
    const hour = h % 24;
    return `${d} hari ${hour} jam ${m} menit`;
  };

  const formatRupiah = (n: number | string | null | undefined) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(n) || 0);

  const handleConfirmUsed = async () => {
    const res = await fetch(`/api/pembayaran/${pembayaranId}/selesai`, {
      method: "PATCH",
    });

    if (res.ok) {
      router.push("/profile/pesanan");
    } else {
      alert("Gagal konfirmasi penggunaan tiket 😥");
    }
  };

  if (loading || !pembayaran) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Ngecek status dulu yaa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={4} />

      <Card className="mt-4 p-4 space-y-4">
        <h2 className="text-lg font-bold">4. Konfirmasi Penggunaan Tiket</h2>

        <div className="text-sm space-y-2">
          <p className="text-muted-foreground">
            Pembayaran kamu udah sukses dan penjual udah dihubungi. Kalau kamu udah pake tiketnya, tinggal klik tombol di bawah~
          </p>

          <div>
            <span className="font-medium">🎫 Konser:</span>{" "}
            {pembayaran.ticket.konser.nama}
          </div>
          <div>
            <span className="font-medium">🧑‍💼 Penjual:</span>{" "}
            {pembayaran.ticket.user.name}
          </div>
          <div>
            <span className="font-medium">💸 Total Bayar:</span>{" "}
            {formatRupiah(pembayaran.jumlahTotal)}
          </div>

          <div className="bg-yellow-100 border border-yellow-300 p-3 text-sm rounded-md mt-4">
            ⏳ <strong>Waktu konfirmasi tersisa:</strong>{" "}
            {timeLeft !== null ? formatCountdown(timeLeft) : "…"}
            <br />
            ⚠️ Kalau kamu tidak konfirmasi dalam 3x24 jam, dana otomatis akan
            ditransfer ke penjual yaa~
          </div>

          <Button onClick={handleConfirmUsed} className="w-full mt-4">
            ✅ Tiket Sudah Digunakan
          </Button>
        </div>

        <Link
          href="/profile/pesanan"
          className="text-xs text-center block underline mt-4 text-muted-foreground hover:text-primary"
        >
          ← Balik ke riwayat pesanan
        </Link>
      </Card>
    </div>
  );
}
