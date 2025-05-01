"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/tiket/Stepper";
import TicketCard from "@/app/components/tickets/TicketCard";
import TicketCardSkeleton from "@/app/components/tickets/TicketCardSkeleton";
import { motion } from "framer-motion";
import { toast } from "sonner";


export default function TambahTiketPage() {
  
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [konserList, setKonserList] = useState<any[]>([]);
  const [selectedKonser, setSelectedKonser] = useState<any>(null);
  const [tipeJual, setTipeJual] = useState<"LELANG" | "JUAL_LANGSUNG" | null>(
    null
  );
  const [detail, setDetail] = useState({
    jumlah: "",
    harga: "",
    tipeTempat: "",
    seat: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Tambah Tiket | MOMEN";
  }, []);
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search2?query=${searchQuery}`);
      const data = await res.json();
      setKonserList(data || []);
    } catch (error) {
      console.error("Gagal cari konser:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 1) {
      setTipeJual(null); // reset pilihan tipe jual
      // setSelectedKonser(null); // aktifkan ini kalau kamu juga mau reset konser
    }
  }, [step]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.length > 1) handleSearch();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleLaunch = () => {
    if (!detail.jumlah || !detail.harga) {
      toast.error("Jumlah dan harga tiket wajib diisi!");
      return;
    }

    toast.success("🎉 Tiket kamu udah tayang! Siap diserbu anak-anak konser!");
    router.push("/"); // nanti ganti dengan redirect ke halaman tiket atau dashboard kamu
  };

  return (
    
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">🪄 Tambah Tiket Baru</h1>
<p className="text-sm text-muted-foreground mb-4">
  Yuk listing tiket konser kamu biar bisa langsung diserbu penonton! 🔥
</p>

      <Stepper step={step} />
      <Separator className="my-4" />

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">1. Cari Konser</h2>
          <Input
            placeholder="Masukkan nama konsernya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && konserList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {konserList.map((k) => (
                <motion.div
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TicketCard
                    namaKonser={k.nama}
                    tanggal={new Date(k.tanggal).toLocaleDateString("id-ID")}
                    lokasi={k.lokasi}
                    onClick={() => {
                      setSelectedKonser(k);
                      toast.success(`🎤 Kamu pilih: ${k.nama}`);
                    }}
                    className={
                      selectedKonser?.id === k.id
                        ? "ring-2 ring-primary scale-[1.02]"
                        : ""
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}

          {!loading &&
            konserList.length === 0 &&
            searchQuery.trim().length > 1 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-6xl mb-4">🫣</div>
                <h3 className="text-lg font-semibold mb-1">
                  Oops! Gak nemu konsernya 😬
                </h3>
                <p className="text-sm">
                  Coba ketik keyword lain deh, siapa tau lagi typo. <br />
                  Atau scroll ke bawah buat daftarin konser kamu sendiri 🎤
                </p>
              </div>
            )}

          <div className="text-sm text-muted-foreground text-center pt-4">
            Gak nemu konsermu?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/daftar-konser")}
            >
              Daftarin dulu yuk
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} disabled={!selectedKonser}>
              Lanjut
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">2. Mau dijual gimana?</h2>
          <p className="text-sm text-muted-foreground">
            Pilih metode penjualan tiket kamu. Mau rame-rame rebutan lelang,
            atau langsung aja bayar lunas 💸
          </p>
          <Button
            variant={tipeJual === "LELANG" ? "default" : "outline"}
            onClick={() => setTipeJual("LELANG")}
            className="w-full"
          >
            🎯 Lelang
          </Button>
          <Button
            variant={tipeJual === "JUAL_LANGSUNG" ? "default" : "outline"}
            onClick={() => setTipeJual("JUAL_LANGSUNG")}
            className="w-full"
          >
            💰 Jual Langsung
          </Button>

          <div className="text-xs text-muted-foreground pt-2">
            Kamu bisa tentuin harga kalau pilih jual langsung. Kalau lelang,
            biarin mereka rebutan 😏
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              ⬅️ Balik
            </Button>
            <Button onClick={() => setStep(3)} disabled={!tipeJual}>
              Lanjut ke Detail
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">3. Detail Tiket 🎫</h2>
          <Input
            placeholder="Jumlah tiket"
            value={detail.jumlah}
            onChange={(e) => setDetail({ ...detail, jumlah: e.target.value })}
          />
          <Input
            placeholder="Harga (Rp)"
            value={detail.harga}
            onChange={(e) => setDetail({ ...detail, harga: e.target.value })}
          />
          <Input
            placeholder="Tipe Tempat Duduk (ex: VIP, Festival)"
            value={detail.tipeTempat}
            onChange={(e) =>
              setDetail({ ...detail, tipeTempat: e.target.value })
            }
          />
          <Input 
            placeholder="Nomor Seat (opsional)"
            value={detail.seat}
            onChange={(e) => setDetail({ ...detail, seat: e.target.value })}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              ⬅️ Balik
            </Button>
            <Button
              onClick={() => {
                if (!detail.jumlah || !detail.harga) {
                  toast.error("Jumlah dan harga tiket wajib diisi!");
                  return;
                }
                setStep(4);
              }}
              disabled={!detail.jumlah || !detail.harga || !detail.tipeTempat}
            >
              Lanjut ke Review
            </Button>
          </div>
        </Card>
      )}
      {/* Step 4 */}
      {step === 4 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">4. Konfirmasi & Launching 🚀</h2>
          <div className="text-sm">
            <div>
              🎤 <b>Konser:</b> {selectedKonser?.nama}
            </div>
            <div>
              📅 <b>Tanggal:</b>{" "}
              {new Date(selectedKonser?.tanggal).toLocaleDateString("id-ID")}
            </div>
            <div>
              📍 <b>Lokasi:</b> {selectedKonser?.lokasi}
            </div>
            <div>
              💼 <b>Metode:</b>{" "}
              {tipeJual === "LELANG" ? "Lelang" : "Jual Langsung"}
            </div>
            <div>
              🎫 <b>Jumlah Tiket:</b> {detail.jumlah}
            </div>
            <div>
              💸 <b>Harga:</b> Rp {Number(detail.harga).toLocaleString("id-ID")}
            </div>
            <div>
              🪑 <b>Tipe Tempat Duduk:</b> {detail.tipeTempat}
            </div>
            {detail.seat && (
              <div>
                🔢 <b>Seat:</b> {detail.seat}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>
              ⬅️ Balik
            </Button>
            <Button onClick={handleLaunch}>Launch Sekarang 🔥</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
