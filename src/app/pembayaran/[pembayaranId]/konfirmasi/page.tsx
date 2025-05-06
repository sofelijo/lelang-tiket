"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stepper } from "@/components/payment/Stepper";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function KonfirmasiPage() {
  const { pembayaranId } = useParams() as { pembayaranId: string };
  const router = useRouter();

  const [pembayaran, setPembayaran] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        if (!data || data.statusPembayaran !== "BERHASIL") {
          // Jika belum bayar, redirect balik
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

  if (loading || !pembayaran) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Lagi ngecek pembayaranmu dulu ya...
          </p>
        </div>
      </div>
    );
  }

  const waAdmin = "6281234567890"; // Ganti dengan nomor admin
  const pesanWA = encodeURIComponent(
    `Halo kak admin! Aku udah bayar tiket konser "${pembayaran.ticket.konser.nama}".\n\n` +
      `👤 Nama Pembeli: ${pembayaran.buyer.name}\n` +
      `👥 Nama Penjual: ${pembayaran.ticket.user.name}\n` +
      `💰 Total Bayar: ${formatRupiah(pembayaran.jumlahTotal)}\n\n` +
      `Tolong dicek yaa 🙏✨`
  );

  return (
    <div className="max-w-xl mx-auto p-4">
      <Stepper step={3} />

      <Card className="mt-4 p-4 space-y-4">
        <h2 className="text-lg font-bold">3. Konfirmasi ke Admin</h2>

        <div className="text-sm space-y-2">
          <p className="text-muted-foreground">
            Yeay! Pembayaran kamu sukses 🎉 Sekarang tinggal konfirmasi aja ke admin biar tiket kamu segera diproses~
          </p>

          <div>
            <span className="font-medium">🎫 Konser:</span>{" "}
            {pembayaran.ticket.konser.nama}
          </div>
          <div>
            <span className="font-medium">🧍 Pembeli:</span>{" "}
            {pembayaran.buyer.name}
          </div>
          <div>
            <span className="font-medium">🧑‍💼 Penjual:</span>{" "}
            {pembayaran.ticket.user.name}
          </div>
          <div>
            <span className="font-medium">💸 Total Bayar:</span>{" "}
            {formatRupiah(pembayaran.jumlahTotal)}
          </div>
        </div>

        <a
          href={`https://wa.me/${waAdmin}?text=${pesanWA}`}
          target="_blank"
          className="block"
        >
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Chat Admin via WhatsApp 🚀
          </button>
        </a>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Pastikan kamu udah kirim bukti kalau diminta ya~
        </p>

        <Link
          href={`/pembayaran/${pembayaranId}`}
          className="text-xs text-center block underline mt-4 text-muted-foreground hover:text-primary"
        >
          ← Balik ke detail pembayaran
        </Link>
      </Card>
    </div>
  );
}
