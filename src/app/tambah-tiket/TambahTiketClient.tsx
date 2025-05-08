//app/tambah-tiket/page.tsx
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
import { format, addDays, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TambahTiketPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [konserList, setKonserList] = useState<any[]>([]);
  const [selectedKonser, setSelectedKonser] = useState<any>(null);
  const maxDate = addDays(new Date(), 7);
  type KonserTop = {
    id: number;
    nama: string;
    tanggal: string;
    lokasi?: string;
    jumlahTiket?: number;
    tipeTempat?: string;
    venue?: string;
    image?: string | null;
  };
  const [topKonser, setTopKonser] = useState<KonserTop[]>([]);

  const [tipeJual, setTipeJual] = useState<"LELANG" | "JUAL_LANGSUNG" | null>(
    null
  );
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [detail, setDetail] = useState<{
    jumlah: string;
    harga: string;
    tipeTempat: string;
    seat: string;
    kategoriId: number | null;
    harga_awal: string;
    harga_beli: string;
    kelipatan: string;
    batas_waktu: string;
    perpanjangan_bid: string;
    deskripsi: string;
    sebelahan: boolean;
  }>({
    jumlah: "",
    harga: "",
    tipeTempat: "",
    seat: "",
    kategoriId: null,
    harga_awal: "",
    harga_beli: "",
    kelipatan: "",
    batas_waktu: "",
    perpanjangan_bid: "TANPA",
    deskripsi: "",
    sebelahan: false,
  });
  const [selectedJam, setSelectedJam] = useState("23:59"); // Default jam awal

  const updateDetailWaktu = (jamString: string) => {
    if (!detail.batas_waktu) return;
    const [hh, mm] = jamString.split(":");
    const date = new Date(detail.batas_waktu);
    date.setHours(Number(hh), Number(mm), 0, 0);
    setDetail({ ...detail, batas_waktu: date.toISOString() });
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Tambah Tiket | MOMEN";
  }, []);

  const handleSearch = async () => {
    if (searchQuery.length < 3) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?query=${searchQuery}`);
      const data = await res.json();
      setKonserList(data || []);
    } catch (error) {
      console.error("Gagal cari konser:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 1) {
      setTipeJual(null);
    }
  }, [step]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.length > 2) handleSearch();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);
  //top konser
  useEffect(() => {
    fetch("/api/top-konser")
      .then((res) => res.json())
      .then((data) => setTopKonser(data));
  }, []);
  // 🔁 Fetch kategori saat konser dipilih
  useEffect(() => {
    if (!selectedKonser?.id) return;

    const fetchKategori = async () => {
      try {
        const res = await fetch(`/api/kategori?konserId=${selectedKonser.id}`);
        const data = await res.json();
        setKategoriList(data || []);
      } catch (err) {
        console.error("Gagal fetch kategori:", err);
      }
    };

    fetchKategori();
  }, [selectedKonser]);

  const handleLaunch = async () => {
    const payload = {
      konserId: selectedKonser?.id,
      kategoriId: detail.kategoriId,
      seat: detail.seat || null,
      tipeTempat: detail.tipeTempat,
      harga_awal: detail.harga_awal || null,
      batas_waktu: detail.batas_waktu || null,
      harga_beli: detail.harga_beli || null,
      kelipatan: detail.kelipatan || null,
      perpanjangan_bid: detail.perpanjangan_bid || null,
      deskripsi: detail.deskripsi || "",
      jumlah: detail.jumlah,
      statusLelang: tipeJual === "LELANG" ? "BERLANGSUNG" : "SELESAI",
    };

    console.log("🚀 Payload kirim tiket:", payload);

    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      console.log("✅ Response:", result);

      if (!res.ok) {
        throw new Error(result.message || "Unknown error");
      }

      toast.success("🎉 Tiket kamu berhasil di-launching!");
      router.push("/");
    } catch (err: any) {
      console.error("❌ Gagal launching tiket:", err);
      toast.error(`Gagal launching tiket: ${err.message || "Unknown error"}`);
    }
  };

  function formatHarga(value: string): string {
    if (!value) return "";
    const num = parseInt(value.replace(/\D/g, ""));
    return "Rp " + num.toLocaleString("id-ID");
  }

  function parseAngka(value: string): string {
    return value.replace(/[^\d]/g, ""); // Hapus semua karakter selain angka
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
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
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground border border-border">
              <span className="text-primary">💡</span>
              <span className="leading-snug">
                Hmm... kurang panjang. Minimal 3 karakter yaa ✨
              </span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Saat search kosong => tampilkan top konser */}
          {!loading && searchQuery.trim() === "" && topKonser.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">
                🔥 Konser Terpopuler
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topKonser.map((k) => (
                  <TicketCard
                    namaKonser={k.nama}
                    tanggal={new Date(k.tanggal).toLocaleDateString("id-ID")}
                    lokasi={k.lokasi}
                    jumlahTiket={k.jumlahTiket}
                    tipeTempat={k.tipeTempat}
                    venue={k.venue}
                    image={k.image}
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
                ))}
              </div>
            </div>
          )}

          {/* Hasil pencarian */}
          {!loading && searchQuery.trim() !== "" && konserList.length > 0 && (
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
                    jumlahTiket={k.jumlahTiket}
                    tipeTempat={k.tipeTempat}
                    venue={k.venue}
                    image={k.image}
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

          {/* Tidak ada hasil */}
          {!loading &&
            konserList.length === 0 &&
            searchQuery.trim().length > 2 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-6xl mb-4">🫣</div>
                <h3 className="text-lg font-semibold mb-1">
                  Oops! Gak nemu konsernya 😬
                </h3>
                <p className="text-sm">
                  Coba ketik keyword lain deh, siapa tau lagi typo. <br />
                  Atau scroll ke bawah buat daftarin konser kamu sendiri 🎤
                </p>
                <div className="text-sm text-muted-foreground text-center pt-4">
                  Gak nemu konsermu?{" "}
                  <Button
                    variant="link"
                    onClick={() => router.push("/daftar-konser")}
                  >
                    Daftarin dulu yuk
                  </Button>
                </div>
              </div>
            )}

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

      {/* Step 3 */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">3. Detail Tiket 🎫</h2>

          <div className="text-sm text-muted-foreground mb-2">
            🎤 Konser: <b>{selectedKonser?.nama}</b>
          </div>

          {/* Dropdown kategori */}
          <div>
            <label className="text-sm font-medium">🎟️ Kategori Tiket</label>
            <select
              className="w-full border border-input bg-background p-2 rounded-md"
              value={detail.kategoriId || ""}
              onChange={(e) =>
                setDetail({ ...detail, kategoriId: parseInt(e.target.value) })
              }
            >
              <option value="">Pilih kategori...</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tipe tempat duduk */}
          <div>
            <label className="text-sm font-medium">🪑 Tipe Tempat</label>
            <div className="flex gap-4 pt-1">
              {["duduk", "berdiri"].map((tipe) => (
                <Button
                  key={tipe}
                  variant={detail.tipeTempat === tipe ? "default" : "outline"}
                  onClick={() =>
                    setDetail({
                      ...detail,
                      tipeTempat: tipe,
                      seat: tipe === "berdiri" ? "" : detail.seat,
                    })
                  }
                >
                  {tipe === "duduk" ? "🪑 Duduk" : "🕺 Berdiri"}
                </Button>
              ))}
            </div>
          </div>

          {/* Checkbox sebelahan */}
          {detail.tipeTempat === "duduk" && (
            <label className="flex items-center gap-2 text-sm pt-2">
              <input
                type="checkbox"
                checked={detail.sebelahan || false}
                onChange={(e) =>
                  setDetail({ ...detail, sebelahan: e.target.checked })
                }
              />
              Mau duduknya barengan kayak bestie 😎
            </label>
          )}

          {/* Seat hanya jika duduk */}
          {detail.tipeTempat === "duduk" && (
            <div className="flex gap-2 items-end">
              <Input
                placeholder="Nomor Seat (contoh: C23)"
                value={detail.seat}
                onChange={(e) => setDetail({ ...detail, seat: e.target.value })}
                readOnly={detail.seat === "duduk bebas"}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDetail({
                    ...detail,
                    seat: detail.seat === "duduk bebas" ? "" : "duduk bebas",
                  });
                }}
              >
                {detail.seat === "duduk bebas"
                  ? "❌ Gak jadi random"
                  : "🎲 Random"}
              </Button>
            </div>
          )}

          {/* Jumlah dan deskripsi */}
          <div>
            <label className="text-sm font-medium">🎫 Jumlah Tiket</label>
            <Input
              placeholder="Jumlah tiket"
              value={detail.jumlah}
              onChange={(e) => setDetail({ ...detail, jumlah: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">📝 Deskripsi Tambahan</label>
            <textarea
              className="w-full border border-input bg-background p-2 rounded-md"
              rows={3}
              placeholder="Deskripsi tambahan..."
              value={detail.deskripsi || ""}
              onChange={(e) =>
                setDetail({ ...detail, deskripsi: e.target.value })
              }
            />
          </div>

          {/* Field berbeda berdasarkan metode */}
          {tipeJual === "LELANG" ? (
            <>
              <label className="text-sm font-medium">💸 Harga Awal</label>
              <Input
                placeholder="Rp 1.000.000"
                value={formatHarga(detail.harga_awal)}
                onChange={(e) =>
                  setDetail({
                    ...detail,
                    harga_awal: parseAngka(e.target.value),
                  })
                }
              />

              <label className="text-sm font-medium">📈 Kelipatan Bid</label>
              <Input
                placeholder="Rp 50.000"
                value={formatHarga(detail.kelipatan)}
                onChange={(e) =>
                  setDetail({
                    ...detail,
                    kelipatan: parseAngka(e.target.value),
                  })
                }
              />

              <label className="text-sm font-medium">
                💰 Harga Beli Langsung
              </label>
              <Input
                placeholder="Rp 2.000.000"
                value={formatHarga(detail.harga_beli)}
                onChange={(e) =>
                  setDetail({
                    ...detail,
                    harga_beli: parseAngka(e.target.value),
                  })
                }
              />

              <label className="text-sm font-medium">
                ⏰ Batas Waktu Lelang
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {detail.batas_waktu ? (
                      new Date(detail.batas_waktu).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    ) : (
                      <span>Pilih batas waktu lelang</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-4 space-y-4">
                  {/* Kalender */}
                  <Calendar
                    mode="single"
                    selected={
                      detail.batas_waktu
                        ? new Date(detail.batas_waktu)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;

                      const max = addDays(new Date(), 7);
                      if (date > max) {
                        toast.error(
                          "🚫 Jangan terlalu jauh yaa, max 7 hari aja 🤏"
                        );
                        return;
                      }

                      const [hh, mm] = selectedJam.split(":");
                      date.setHours(Number(hh), Number(mm), 0, 0);
                      setDetail({ ...detail, batas_waktu: date.toISOString() });
                    }}
                    initialFocus
                  />

                  {/* Picker Jam */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jam</label>
                    <div className="flex gap-2">
                      <select
                        className="border border-input bg-background rounded-md p-2 text-sm"
                        value={selectedJam.split(":")[0]}
                        onChange={(e) => {
                          const newJam = `${e.target.value}:${
                            selectedJam.split(":")[1]
                          }`;
                          setSelectedJam(newJam);
                          updateDetailWaktu(newJam);
                        }}
                      >
                        {[...Array(24)].map((_, i) => {
                          const val = i.toString().padStart(2, "0");
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        className="border border-input bg-background rounded-md p-2 text-sm"
                        value={selectedJam.split(":")[1]}
                        onChange={(e) => {
                          const newJam = `${selectedJam.split(":")[0]}:${
                            e.target.value
                          }`;
                          setSelectedJam(newJam);
                          updateDetailWaktu(newJam);
                        }}
                      >
                        {["00", "15", "30", "45"].map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <label className="text-sm font-medium">🔁 Perpanjangan Bid</label>
              <select
                className="w-full border border-input bg-background p-2 rounded-md"
                value={detail.perpanjangan_bid || "TANPA"}
                onChange={(e) =>
                  setDetail({ ...detail, perpanjangan_bid: e.target.value })
                }
              >
                <option value="TANPA">Tanpa</option>
                <option value="SATU_HARI">+1 Hari</option>
                <option value="DUA_HARI">+2 Hari</option>
              </select>
            </>
          ) : (
            <>
              <label className="text-sm font-medium">💳 Harga Tiket</label>
              <Input
                placeholder="Rp 1.500.000"
                value={formatHarga(detail.harga_beli)}
                onChange={(e) =>
                  setDetail({
                    ...detail,
                    harga_beli: parseAngka(e.target.value),
                  })
                }
              />
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              ⬅️ Balik
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={
                !detail.jumlah ||
                !detail.tipeTempat ||
                !detail.kategoriId ||
                (tipeJual === "LELANG"
                  ? !detail.harga_awal ||
                    !detail.kelipatan ||
                    !detail.batas_waktu ||
                    !detail.harga_beli
                  : !detail.harga_beli)
              }
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
          <div className="text-sm space-y-2">
            <div>
              🎤 <b>Konser:</b> {selectedKonser?.nama} -{" "}
              {kategoriList.find((k) => k.id === detail.kategoriId)?.nama ||
                "Kategori tidak ditemukan"}
            </div>
            <div>
              📍 <b>Tanggal & Lokasi:</b>{" "}
              {new Date(selectedKonser?.tanggal).toLocaleDateString("id-ID")} —{" "}
              {selectedKonser?.lokasi}
            </div>
            <div>
              💼 <b>Metode:</b>{" "}
              {tipeJual === "LELANG" ? "Lelang" : "Jual Langsung"}
            </div>
            <div>
              🎫 <b>Jumlah Tiket:</b> {detail.jumlah}
            </div>
            <div>
              🪑 <b>Tipe Tempat Duduk:</b> {detail.tipeTempat}
              {detail.seat ? ` (${detail.seat})` : ""}
              {detail.sebelahan ? " /sebelahan" : ""}
            </div>

            {tipeJual === "LELANG" ? (
              <>
                <div>
                  💸 <b>Harga Awal:</b> Rp{" "}
                  {Number(detail.harga_awal).toLocaleString("id-ID")}
                </div>
                <div>
                  🪙 <b>Kelipatan:</b> Rp{" "}
                  {Number(detail.kelipatan).toLocaleString("id-ID")}
                </div>
                <div>
                  🛒 <b>Harga Beli Langsung:</b> Rp{" "}
                  {Number(detail.harga_beli).toLocaleString("id-ID")}
                </div>
                <div>
                  ⏰ <b>Batas Waktu:</b>{" "}
                  {new Date(detail.batas_waktu).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  🔁 <b>Perpanjangan Bid:</b> {detail.perpanjangan_bid}
                </div>
              </>
            ) : (
              <div>
                💸 <b>Harga Tiket:</b> Rp{" "}
                {Number(detail.harga_beli).toLocaleString("id-ID")}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>
              ⬅️ Balik
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">Launch Sekarang🔥</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    🚀 Yakin mau launching sekarang?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tiket bakal langsung tayang!
                    <br />
                    ⚠️ <b>Catatan:</b> Kalau ini lelang, gak bisa dihapus lagi
                    setelah 1 jam ya 🫣
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-foreground border border-border bg-background hover:bg-muted">
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleLaunch}>
                    Oke Gas!
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}
    </div>
  );
}
