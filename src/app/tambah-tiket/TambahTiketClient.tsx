//app/tambah-tiket/TambahTickeClient.tsx
"use client";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const konserIdParam = searchParams.get("konserId");

    if (stepParam === "2" && konserIdParam) {
      // fetch konser dari API
      fetch(`/api/konser/${konserIdParam}`)
        .then((res) => res.json())
        .then((data) => {
          setSelectedKonser(data);
          setStep(2);
        })
        .catch((err) => {
          console.error("Gagal ambil konser dari query:", err);
        });
    }
  }, [searchParams]);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [konserList, setKonserList] = useState<any[]>([]);
  const [selectedKonser, setSelectedKonser] = useState<any>(null);
  const [loadingTopKonser, setLoadingTopKonser] = useState(false);

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
    row: string; // ✅ tambahkan ini
    kategoriId: number | null;
    harga_awal: string;
    harga_beli: string;
    kelipatan: string;
    batas_waktu: string;
    perpanjangan_bid: string;
    deskripsi: string;
    sebelahan: boolean;
  }>({
    jumlah: "1",
    harga: "",
    tipeTempat: "",
    seat: "",
    row: "", // ✅ inisialisasi default
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
    document.title = "Tambah Tiket | ";
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
    setLoadingTopKonser(true);
    fetch("/api/top-konser")
      .then((res) => res.json())
      .then((data) => setTopKonser(data))
      .catch((err) => console.error("Gagal fetch top konser:", err))
      .finally(() => setLoadingTopKonser(false));
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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (Object.keys(data).length > 0) setSession(data);
    }
    fetchSession();
  }, []);

  const handleLaunch = async () => {
    const payload = {
      konserId: selectedKonser?.id,
      kategoriId: detail.kategoriId,
      seat: detail.seat || null,
      tipeTempat: detail.tipeTempat,
      //harga_awal: detail.harga_awal || null,
      harga_awal: detail.harga_awal ? parseInt(detail.harga_awal) : null,
      batas_waktu: detail.batas_waktu || null,
      //harga_beli: detail.harga_beli || null,
      //kelipatan: detail.kelipatan || null,
      harga_beli: detail.harga_beli ? parseInt(detail.harga_beli) : null,
  kelipatan: detail.kelipatan ? parseInt(detail.kelipatan) : null,
      perpanjangan_bid: detail.perpanjangan_bid || null,
      deskripsi: detail.deskripsi || "",
      jumlah: detail.jumlah,
      statusLelang: tipeJual === "LELANG" ? "BERLANGSUNG" : "SELESAI",
      row: detail.row || null,
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

      // lanjut kirim notifikasi seperti biasa...

      if (!res.ok) {
        throw new Error(result.message || "Unknown error");
      }

      // 🔍 Log sesi user
      console.log("👤 Session user ID:", session?.user?.id);

      // 🔔 Kirim notifikasi
      const notifRes = await fetch("/api/notifikasi/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          pesan: `🚀 Tiket konser ${selectedKonser?.nama} berhasil kamu listing!`,
          link: `/ticket/${result.id}`,
        }),
      });

      const notifResult = await notifRes.json();
      console.log("🔔 Response notifikasi:", notifResult);

      if (!notifRes.ok) {
        throw new Error("Gagal kirim notifikasi: " + notifResult.message);
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🪄 Tambah Tiket Baru</h1>
        <p className="text-sm text-muted-foreground">
          🔥 Yuk listing tiket konser kamu biar bisa langsung diserbu penonton!
        </p>
      </div>

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
          {!loading && searchQuery.trim() === "" && (
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">
                🔥 Konser Terpopuler
              </p>

              {loadingTopKonser ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <TicketCardSkeleton key={i} />
                  ))}
                </div>
              ) : topKonser.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topKonser.map((k) => (
                    <TicketCard
                      key={k.id}
                      namaKonser={k.nama}
                      tanggal={new Date(k.tanggal).toLocaleDateString("id-ID")}
                      lokasi={k.lokasi}
                      jumlahTiket={k.jumlahTiket}
                      tipeTempat={k.tipeTempat}
                      venue={k.venue}
                      image={k.image}
                      onClick={() => {
                        setSelectedKonser(k);
                        toast.success(
                          `✌️ Klik dua kali aja biar langsung gas!`
                        );
                      }}
                      onDoubleClick={() => {
                        setSelectedKonser(k);
                        setStep(2);
                        toast.success(`🎉 Langsung ke Step 2 bareng ${k.nama}`);
                      }}
                      className={
                        selectedKonser?.id === k.id
                          ? "ring-2 ring-primary scale-[1.02]"
                          : ""
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada konser terpopuler 🫠
                </p>
              )}
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
                      toast.success(`✌️ Klik dua kali aja biar langsung gas!`);
                    }}
                    onDoubleClick={() => {
                      setSelectedKonser(k);
                      setStep(2);
                      toast.success(`🎉 Langsung ke Step 2 bareng ${k.nama}`);
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
          <div className="flex flex-col md:flex-row gap-3">
  <Button
    variant={tipeJual === "LELANG" ? "default" : "outline"}
    onClick={() => {
      setTipeJual("LELANG");
      toast.success(`✌️ Klik dua kali aja biar langsung gas!`);
    }}
    onDoubleClick={() => {
      setStep(3);
      toast.success(`🎉 Langsung ke Step 3 tipe ${tipeJual}`);
    }}
    className="flex-1 py-4 h-auto"
  >
    <div className="text-center leading-tight">
      <div className="text-sm font-bold">🎯 Lelang</div>
      <div className="text-xs text-muted-foreground mt-1">
        Buka harga awal, <br />
        biarin pembeli saling nawar 🔥
      </div>
    </div>
  </Button>

  <Button
    variant={tipeJual === "JUAL_LANGSUNG" ? "default" : "outline"}
    onClick={() => {
      setTipeJual("JUAL_LANGSUNG");
      toast.success(`✌️ Klik dua kali aja biar langsung gas!`);
    }}
    onDoubleClick={() => {
      setStep(3);
      toast.success(`🎉 Langsung ke Step 3 tipe ${tipeJual}`);
    }}
    className="flex-1 py-4 h-auto"
  >
    <div className="text-center leading-tight">
      <div className="text-sm font-bold">💰 Jual Langsung</div>
      <div className="text-xs text-muted-foreground mt-1">
        Kasih harga fix, <br />
        yang siap bayar langsung sikat 💸
      </div>
    </div>
  </Button>
</div>


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

          {/* Tipe tempat duduk */}
          <div className="flex flex-col md:flex-row flex-wrap gap-4">
            {/* Kategori Tiket */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium block mb-1">
                🎟️ Kategori
              </label>
              <select
                className="w-full border border-input bg-background p-2 rounded-md text-sm"
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

            {/* Tipe Tempat */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium block mb-1">
                🪑 Tempat
              </label>
              <div className="flex gap-2">
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
                    className="px-3 py-2 text-xs"
                  >
                    {tipe === "duduk" ? "🪑 Duduk" : "🕺 Berdiri"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Jumlah Tiket */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium block mb-1">
                🎫 Jumlah
              </label>
              <select
                value={detail.jumlah}
                onChange={(e) =>
                  setDetail({ ...detail, jumlah: e.target.value })
                }
                className="w-full border border-input rounded-md px-2 py-2 text-sm bg-background text-foreground"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={String(val)}>
                    {val} tiket
                  </option>
                ))}
              </select>
            </div>

            {/* Row atau Queue (label dinamis, value tetap pakai detail.row) */}
            {/* Row atau Queue */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium block mb-1">
                {detail.tipeTempat === "duduk"
                  ? "↕️ Baris (Row)"
                  : "🔀 Antrean (Queue)"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    detail.tipeTempat === "duduk" ? "1, A?" : "1, 2, 3?"
                  }
                  value={detail.row || ""}
                  disabled={detail.row === "Tidak Ada"}
                  onChange={(e) =>
                    setDetail({ ...detail, row: e.target.value.toUpperCase() })
                  }
                  className="w-full border border-input bg-background p-2 rounded-md text-sm disabled:opacity-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs px-2 py-1"
                  onClick={() => {
                    setDetail((prev) => ({
                      ...prev,
                      row: prev.row === "Tidak Ada" ? "" : "Tidak Ada",
                    }));
                  }}
                >
                  {detail.row === "Tidak Ada" ? "Ada?" : "Tidak Ada"}
                </Button>
              </div>
            </div>

            {/* Sebelahan */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium block mb-1">
                ✅ Sebelahan 😎
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={detail.sebelahan || false}
                  onChange={(e) =>
                    setDetail({ ...detail, sebelahan: e.target.checked })
                  }
                  className="w-5 h-5 accent-green-600 mt-1"
                />
                <span className="text-xs text-muted-foreground leading-snug">
                  Biar gak duduk sendiri 😢
                </span>
              </label>
            </div>
          </div>

          {/* Checkbox sebelahan */}

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
            <div className="grid md:grid-cols-3 gap-4">
              {/* Harga Awal */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  💸 Harga Awal
                </label>
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
              </div>

              {/* Kelipatan */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  📈 Kelipatan Bid
                </label>
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
              </div>

              {/* Harga Beli Langsung */}
              <div>
                <label className="text-sm font-medium mb-1 block">
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
              </div>

              {/* Batas Waktu */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">
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
                        setDetail({
                          ...detail,
                          batas_waktu: date.toISOString(),
                        });
                      }}
                      initialFocus
                    />
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
              </div>

              {/* Perpanjangan Bid */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  🔁 Perpanjangan Bid
                </label>
                <select
                  className="w-full border border-input bg-background p-2 rounded-md text-sm"
                  value={detail.perpanjangan_bid || "TANPA"}
                  onChange={(e) =>
                    setDetail({ ...detail, perpanjangan_bid: e.target.value })
                  }
                >
                  <option value="TANPA">Tanpa</option>
                  <option value="SATU_HARI">+1 Hari</option>
                  <option value="DUA_HARI">+2 Hari</option>
                </select>
              </div>
            </div>
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
          <h2 className="text-xl font-bold">4.  {tipeJual === "LELANG" ? "Lelang" : "Jual Langsung"} | Konfirmasi & Launching 🚀 </h2>
          <Separator />

          <div className="flex flex-col md:flex-row gap-6">
            {/* Kolom Kiri: Detail */}
            <div className="flex-1 text-sm space-y-2">
              <div>
                🎤 <b>Konser:</b> {selectedKonser?.nama}{" "}
              </div>
              <div>
                📍 <b>Tanggal & Lokasi:</b>{" "}
                {new Date(selectedKonser?.tanggal).toLocaleDateString("id-ID")}{" "}
                — {selectedKonser?.lokasi}
              </div>
              
              <div>
                🎫 <b>Kategori:</b> {kategoriList.find((k) => k.id === detail.kategoriId)?.nama ||
                  "Kategori tidak ditemukan"}{" | "}{detail.jumlah}{" "}Tiket
              </div>
              <div>
                🪑 <b>Tipe Tempat Duduk:</b> {detail.tipeTempat}
                {detail.seat ? ` (${detail.seat})` : ""}
                {detail.sebelahan ? " /sebelahan" : ""}
              </div>
              {/* 🔀 Baris atau Antrean */}
              <div>
                {detail.tipeTempat === "duduk" ? (
                  <>
                    ↕️ <b>Baris (Row):</b>{" "}
                  </>
                ) : (
                  <>
                    🔀 <b>Antrean (Queue):</b>{" "}
                  </>
                )}
                {detail.row === "NO" ? (
                  <i>Tidak Ada</i>
                ) : (
                  <span>{detail.row || "-"}</span>
                )}
              </div>

              {tipeJual === "LELANG" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {/* Kolom 1 */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <div className="text-muted-foreground text-xs mb-1">
                        💸 Harga Awal
                      </div>
                      <div className="font-semibold">
                        Rp {Number(detail.harga_awal).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* Kolom 2 */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <div className="text-muted-foreground text-xs mb-1">
                        🪙 Kelipatan
                      </div>
                      <div className="font-semibold">
                        Rp {Number(detail.kelipatan).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* Kolom 3 */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <div className="text-muted-foreground text-xs mb-1">
                        🛒 Harga Beli Langsung
                      </div>
                      <div className="font-semibold">
                        Rp {Number(detail.harga_beli).toLocaleString("id-ID")}
                      </div>
                    </div>
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

            {/* Kolom Kanan: Gambar */}
            <div className="w-full md:w-64">
              <img
                src={selectedKonser?.image || "/dummy-konser.jpg"}
                alt="Gambar konser"
                className="rounded-lg w-full h-100 object-cover border border-border shadow"
              />
            </div>
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
