"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stepper } from "@/components/payment/Stepper";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // pastikan ini sudah ada

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

  const waPenjual = pembayaran.ticket.user?.phoneNumber;
  const waPembeli = pembayaran.buyer?.phoneNumber;
  const waAdmin = "6281234567890"; // bisa diganti

  const urlKonfirmasi = `https://www.yuknawar.com/pembayaran/${pembayaranId}/konfirmasi`;

  const pesanPenjual = encodeURIComponent(
    `Halo kak ${pembayaran.ticket.user.name}, aku udah bayar tiket konser "${pembayaran.ticket.konser.nama}".\n\n` +
      `👤 Aku pembeli di yuknawar.com, nomor WA-ku: ${waPembeli}\n` +
      `Ini link bukti konfirmasinya ya: ${urlKonfirmasi}\n\n` +
      `Mohon bantuannya untuk segera diproses 🙏✨`
  );

  const pesanAdmin = encodeURIComponent(
    `Halo admin, aku sudah bayar tiket konser "${pembayaran.ticket.konser.nama}" tapi belum dapat respon dari penjual.\n\n` +
      `Nama pembeli: ${pembayaran.buyer.name} (${waPembeli})\n` +
      `Konfirmasi: ${urlKonfirmasi}`
  );

  return (
    <div className="max-w-xl mx-auto p-4 relative">
      <Stepper step={3} />

      <Card className="mt-4 p-4 space-y-4">
        <h2 className="text-lg font-bold">3. Hubungi Penjual</h2>

        <div className="text-sm space-y-2">
          <p className="text-muted-foreground">
            Pembayaran kamu udah sukses 🎉 Sekarang tinggal konfirmasi ke
            penjual biar tiket kamu segera diproses~
          </p>

          {/* Nama Konser + tombol detail tiket */}
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">🎫 Konser:</span>{" "}
              {pembayaran.ticket.konser.nama}
            </div>
            <Link
              href={`/ticket/${pembayaran.ticket.id}`}
              target="_blank"
              className="text-xs underline text-blue-600 hover:text-blue-800"
            >
              🔍 Lihat Tiket
            </Link>
          </div>

          {/* Badge style Gen Z */}
          <div className="flex flex-wrap gap-2 mt-1">
            {/* Tipe tempat */}
            {pembayaran.ticket.tipeTempat === "duduk" && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                🪑 Duduk
              </span>
            )}
            {pembayaran.ticket.tipeTempat === "berdiri" && (
              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                🕺 Berdiri
              </span>
            )}

            {/* Nomor seat */}
            {pembayaran.ticket.seat && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                💺 Seat: {pembayaran.ticket.seat}
              </span>
            )}

            {/* Jumlah tiket */}
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
              🎟️ {pembayaran.ticket.jumlah} Tiket
            </span>

            {/* Kategori */}
            <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800">
              🎫 {pembayaran.ticket.kategori.nama}
            </span> 

            {/* Sebelahan */}
            {pembayaran.ticket.sebelahan && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                👯‍♂️ Sebelahan
              </span>
            )}
          </div>

          <div>
            <span className="font-medium">🧍 Pembeli:</span>{" "}
            {pembayaran.buyer.name} ({waPembeli || "no WA"})
          </div>
          <div>
            <span className="font-medium">🧑‍💼 Penjual:</span>{" "}
            {pembayaran.ticket.user.name} ({waPenjual || "no WA"})
          </div>
          <div>
            <span className="font-medium">💸 Total Bayar:</span>{" "}
            {formatRupiah(pembayaran.jumlahTotal)}
          </div>

          <a
            href={`https://wa.me/${waPenjual}?text=${pesanPenjual}`}
            target="_blank"
            className="block mt-3"
          >
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Chat Penjual via WhatsApp 📱
            </button>
          </a>

          <div className="text-xs text-yellow-700 bg-yellow-100 border border-yellow-300 p-2 rounded-md mt-2">
            ⚠️ <strong>Tips keamanan:</strong> Pastikan nomor WhatsApp yang
            menghubungi kamu sesuai dengan yang tertera di halaman ini.
          </div>
        </div>

        <Link
          href={`/pembayaran/${pembayaranId}?skipAutoRedirect=true`}
          className="text-xs text-center block underline mt-4 text-muted-foreground hover:text-primary"
        >
          ← Balik ke detail pembayaran
        </Link>
      </Card>

      {/* Tombol bantuan admin kecil di pojok kanan bawah */}
      <a
        href={`https://wa.me/${waAdmin}?text=${pesanAdmin}`}
        target="_blank"
        className="fixed bottom-6 right-6 z-50"
      >
        <button className="bg-black text-white px-3 py-2 text-sm rounded-full shadow-lg hover:bg-gray-900 transition">
          ❓ Butuh Bantuan Admin
        </button>
      </a>
    </div>
  );
}
