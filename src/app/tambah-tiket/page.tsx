"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import { Loader2 } from "lucide-react";
import TicketCard from "@/app/components/tickets/TicketCard";
import TicketCardSkeleton from "../components/tickets/TicketCardSkeleton";


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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?query=${searchQuery}`);
      const data = await res.json();
      setKonserList(data || []); // ini array konser langsung
    } catch (error) {
      console.error("Gagal cari konser:", error);
    }
    setLoading(false);
  };
  

  const handleLaunch = () => {
    // Submit ke API listing
    alert("🎉 Tiket kamu udah tayang! Sikat!");
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Stepper step={step} />
      <Separator className="my-4" />

      {/* Step 1 */}

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">1. Cari Konser</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan nama konsernya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch}>Cari</Button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && konserList.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {konserList.map((k) => (
                <TicketCard
                  key={k.id}
                  namaKonser={k.nama}
                  tanggal={new Date(k.tanggal).toLocaleDateString("id-ID")}
                  lokasi={k.lokasi}
                  onClick={() => setSelectedKonser(k)}
                />
              ))}
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
      {/* Step 2 */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">2. Mau dijual gimana?</h2>
          <div className="flex gap-4">
            <Button
              variant={tipeJual === "LELANG" ? "default" : "outline"}
              onClick={() => setTipeJual("LELANG")}
            >
              Lelang 🎯
            </Button>
            <Button
              variant={tipeJual === "JUAL_LANGSUNG" ? "default" : "outline"}
              onClick={() => setTipeJual("JUAL_LANGSUNG")}
            >
              Jual Langsung 💸
            </Button>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button onClick={() => setStep(3)} disabled={!tipeJual}>
              Lanjut
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">3. Isi Detail Tiket</h2>
          <Input
            placeholder="Jumlah Tiket"
            type="number"
            value={detail.jumlah}
            onChange={(e) => setDetail({ ...detail, jumlah: e.target.value })}
          />
          <Input
            placeholder="Harga (kalau jual langsung)"
            type="number"
            value={detail.harga}
            onChange={(e) => setDetail({ ...detail, harga: e.target.value })}
            disabled={tipeJual === "LELANG"}
          />
          <Input
            placeholder="Tipe Tempat Duduk (misal: VIP, Tribun)"
            value={detail.tipeTempat}
            onChange={(e) =>
              setDetail({ ...detail, tipeTempat: e.target.value })
            }
          />
          <Input
            placeholder="Nomor Kursi (opsional)"
            value={detail.seat}
            onChange={(e) => setDetail({ ...detail, seat: e.target.value })}
          />
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              Kembali
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={
                !detail.jumlah ||
                (tipeJual === "JUAL_LANGSUNG" && !detail.harga)
              }
            >
              Lanjut
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">4. Review dan Launch!</h2>
          <div className="text-sm space-y-1">
            <div>🎤 Konser: {selectedKonser?.nama}</div>
            <div>
              📅 Tanggal:{" "}
              {new Date(selectedKonser?.tanggal).toLocaleDateString("id-ID")}
            </div>
            <div>
              💼 Tipe Jual: {tipeJual === "LELANG" ? "Lelang" : "Jual Langsung"}
            </div>
            <div>🎫 Jumlah: {detail.jumlah}</div>
            {tipeJual === "JUAL_LANGSUNG" && (
              <div>💰 Harga: Rp {detail.harga}</div>
            )}
            <div>📍 Tempat Duduk: {detail.tipeTempat}</div>
            <div>🪑 Nomor Kursi: {detail.seat || "-"}</div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(3)}>
              Balik dulu
            </Button>
            <Button onClick={handleLaunch}>🚀 Launching Sekarang!</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
