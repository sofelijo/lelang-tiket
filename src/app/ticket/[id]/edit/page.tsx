// File: app/tiket/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function EditTiketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;

  const [ticket, setTicket] = useState<any>(null);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJam, setSelectedJam] = useState("23:59");
  const [session, setSession] = useState<any>(null);
  const [invalidTime, setInvalidTime] = useState(false);

  const fetchSession = async () => {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    if (data?.user) setSession(data);
  };

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/ticket/${ticketId}`);
      const data = await res.json();
      setTicket(data);

      const katRes = await fetch(`/api/kategori?konserId=${data.konserId}`);
      const katData = await katRes.json();
      setKategoriList(katData);
    } catch (err) {
      toast.error("😵‍💫 Gagal ambil data tiketmu, coba refresh deh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchTicket();
  }, []);

  const isOwner = ticket?.userId === Number(session?.user?.id);
  const isLelang = ticket?.kelipatan !== null;
  const createdAt = new Date(ticket?.createdAt);
  const now = new Date();
  const msDiff = now.getTime() - createdAt.getTime();
  const isEditable = !isLelang || (msDiff < 60 * 60 * 1000 && ticket.statusLelang === "BERLANGSUNG");

  const maxBatasWaktu = new Date(createdAt);
  maxBatasWaktu.setDate(maxBatasWaktu.getDate() + 7);

  useEffect(() => {
    if (!ticket?.batas_waktu) return;
    const date = new Date(ticket.batas_waktu);
    const [hh, mm] = selectedJam.split(":" ).map(Number);
    date.setHours(hh);
    date.setMinutes(mm);
    setTicket({ ...ticket, batas_waktu: date.toISOString() });
  }, [selectedJam]);

  useEffect(() => {
    if (!ticket?.batas_waktu || !ticket?.createdAt) return;
    const now = new Date();
    const batas = new Date(ticket.batas_waktu);
    const maxBatas = new Date(ticket.createdAt);
    maxBatas.setDate(maxBatas.getDate() + 7);
    setInvalidTime(batas < now || batas > maxBatas);
  }, [ticket?.batas_waktu, ticket?.createdAt, saving]);

  const handleDelete = async () => {
    const res = await fetch(`/api/ticket/${ticketId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("🔥 Tiket kamu udah dihapus total!");
      router.push("/");
    } else {
      toast.error("🚫 Gagal hapus, mungkin waktunya udah kelewatan?");
    }
  };

  const handleSave = async () => {
    if (!ticket.batas_waktu && isLelang) return;

    const batas = new Date(ticket.batas_waktu);
    if (batas > maxBatasWaktu) {
      toast.error("🚨 Gak bisa lebih dari 7 hari sejak kamu buat tiket!");
      return;
    }
    if (batas < now) {
      toast.error("⏳ Masa lalu gak bisa diedit... (waktu gak boleh sebelum sekarang)");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/ticket/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });

      if (res.status === 200) {
        toast.success("✅ Tiket berhasil diupdate, gas ke halaman detail!");
        router.push(`/ticket/${ticketId}`);
      } else {
        const fallback = await res.text();
        throw new Error(fallback || "Unknown error");
      }
    } catch (error) {
      console.error("❌ PATCH gagal:", error);
      toast.error("😓 Gagal update, coba lagi bentar ya");
    } finally {
      setSaving(false);
    }
  };

  const formatHarga = (value: string): string => {
    if (!value) return "";
    const num = parseInt(value.replace(/\D/g, ""));
    return "Rp " + num.toLocaleString("id-ID");
  };

  const parseAngka = (value: string): string => {
    return value.replace(/[^\d]/g, "");
  };

  if (loading) {
    return <div className="p-6 animate-pulse">Loading tiket kamu… 🎫</div>;
  }

  if (!ticket || !isOwner) {
    return <div className="p-6 text-red-500">🚫 Tiket tidak ditemukan atau bukan milikmu.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        ✏️ Edit Tiket {isLelang ? "Lelang" : "Jual Langsung"}
      </h1>
      <Card className="p-6 space-y-4">
        {isEditable && (
          <>
            <label className="block text-sm font-medium">📝 Deskripsi</label>
            <textarea
              className="w-full border border-input rounded-md p-2"
              value={ticket.deskripsi || ""}
              onChange={(e) =>
                setTicket({ ...ticket, deskripsi: e.target.value })
              }
            />
            <label className="block text-sm font-medium">🎟️ Kategori</label>
            <select
              className="w-full border border-input bg-background p-2 rounded-md text-sm"
              value={ticket.kategoriId || ""}
              onChange={(e) =>
                setTicket({ ...ticket, kategoriId: parseInt(e.target.value) })
              }
            >
              <option value="">Pilih kategori...</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
            
            <label className="block text-sm font-medium">🎫 Jumlah</label>
            <select
              value={ticket.jumlah}
              onChange={(e) =>
                setTicket({ ...ticket, jumlah: parseInt(e.target.value) })
              }
              className="w-full border border-input rounded-md px-2 py-2 text-sm bg-background text-foreground"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <option key={val} value={val}>
                  {val} tiket
                </option>
              ))}
            </select>
            
            <label className="block text-sm font-medium">✅ Sebelahan</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-green-600"
                checked={ticket.sebelahan || false}
                onChange={(e) =>
                  setTicket({ ...ticket, sebelahan: e.target.checked })
                }
              />
              <span className="text-muted-foreground text-xs">
                Biar gak duduk sendiri 😢
              </span>
            </label>
            <div className="flex gap-2">
  {["duduk", "berdiri"].map((tipe) => (
    <Button
      key={tipe}
      variant={ticket.tipeTempat === tipe ? "default" : "outline"}
      onClick={() =>
        setTicket({
          ...ticket,
          tipeTempat: tipe,
          seat: tipe === "berdiri" ? "" : ticket.seat,
        })
      }
      className="px-3 py-2 text-xs"
    >
      {tipe === "duduk" ? "🪑 Duduk" : "🕺 Berdiri"}
    </Button>
  ))}
</div>

            {ticket.tipeTempat === "duduk" && (
              <div className="flex gap-2 items-end">
                <Input
                  placeholder="Nomor Seat (contoh: C23)"
                  value={ticket.seat || ""}
                  onChange={(e) =>
                    setTicket({ ...ticket, seat: e.target.value })
                  }
                  readOnly={ticket.seat === "duduk bebas"}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTicket({
                      ...ticket,
                      seat: ticket.seat === "duduk bebas" ? "" : "duduk bebas",
                    });
                  }}
                >
                  {ticket.seat === "duduk bebas"
                    ? "❌ Gak jadi random"
                    : "🎲 Random"}
                </Button>
              </div>
            )}
            {isLelang && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    💸 Harga Awal
                  </label>
                  <Input
                    placeholder="Rp 1.000.000"
                    value={formatHarga(ticket.harga_awal?.toString() || "")}
                    onChange={(e) =>
                      setTicket({
                        ...ticket,
                        harga_awal: parseInt(parseAngka(e.target.value)),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    📈 Kelipatan Bid
                  </label>
                  <Input
                    placeholder="Rp 50.000"
                    value={formatHarga(ticket.kelipatan?.toString() || "")}
                    onChange={(e) =>
                      setTicket({
                        ...ticket,
                        kelipatan: parseInt(parseAngka(e.target.value)),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    💰 Harga Beli Langsung
                  </label>
                  <Input
                    placeholder="Rp 2.000.000"
                    value={formatHarga(ticket.harga_beli?.toString() || "")}
                    onChange={(e) =>
                      setTicket({
                        ...ticket,
                        harga_beli: parseInt(parseAngka(e.target.value)),
                      })
                    }
                  />
                </div>
              </div>
            )}
            {!isLelang && (
  <div>
    <label className="text-sm font-medium mb-1 block">
      💰 Harga Tiket
    </label>
    <Input
      placeholder="Rp 1.500.000"
      value={formatHarga(ticket.harga_beli?.toString() || "")}
      onChange={(e) =>
        setTicket({
          ...ticket,
          harga_beli: parseInt(parseAngka(e.target.value)),
        })
      }
    />
  </div>
)}

          </>
        )}

        {!isEditable && (
          <div className="text-muted-foreground text-sm">
            ⚠️ Lelang sudah berjalan lebih dari 1 jam. Kamu hanya bisa mengatur
            batas waktu dan perpanjangan.
          </div>
        )}

        <Separator />
        {isLelang && (
          <>
            <label className="text-sm font-medium">⏰ Batas Waktu</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {ticket.batas_waktu
                    ? format(new Date(ticket.batas_waktu), "dd MMM yyyy HH:mm")
                    : "Pilih waktu"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-4">
                <Calendar
                  mode="single"
                  selected={ticket.batas_waktu ? new Date(ticket.batas_waktu) : undefined}
                  onSelect={(date) => {
                    if (!date) return;
                    const isToday = date.toDateString() === now.toDateString();
                    let [hh, mm] = selectedJam.split(":" ).map(Number);

                    if (isToday) {
                      const selected = new Date(date);
                      selected.setHours(hh, mm, 0, 0);
                      if (selected < now) {
                        const rounded = Math.ceil(now.getMinutes() / 15) * 15;
                        const nextMinute = rounded === 60 ? 0 : rounded;
                        const nextHour = rounded === 60 ? now.getHours() + 1 : now.getHours();
                        hh = nextHour;
                        mm = nextMinute;
                        setSelectedJam(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
                        toast("⏰ Jam diubah otomatis ke waktu sekarang biar valid ya!");
                      }
                    }

                    date.setHours(hh, mm, 0, 0);
                    if (date > maxBatasWaktu) {
                      toast.error("🚨 Gak bisa lebih dari 7 hari dari tanggal buat tiket!");
                      return;
                    }

                    setTicket({ ...ticket, batas_waktu: date.toISOString() });
                  }}
                  disabled={(date) => {
                    return date < new Date(new Date().setHours(0, 0, 0, 0)) || date > maxBatasWaktu;
                  }}
                />
                <div className="flex gap-2">
                  <select
                    className="border rounded p-2 text-sm"
                    value={selectedJam.split(":" )[0]}
                    onChange={(e) => {
                      const newJam = `${e.target.value}:${selectedJam.split(":" )[1]}`;
                      setSelectedJam(newJam);
                    }}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={selectedJam.split(":" )[1]}
                    onChange={(e) => {
                      const newJam = `${selectedJam.split(":" )[0]}:${e.target.value}`;
                      setSelectedJam(newJam);
                    }}
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </PopoverContent>
            </Popover>
            {invalidTime && (
              <div className="text-xs text-red-500">
                ⚠️ Waktu harus antara sekarang dan maksimal 7 hari dari tanggal buat tiket.
              </div>
            )}

            <label className="text-sm font-medium">🔁 Perpanjangan Bid</label>
            <select
              value={ticket.perpanjangan_bid || "TANPA"}
              onChange={(e) =>
                setTicket({ ...ticket, perpanjangan_bid: e.target.value })
              }
              className="w-full border border-input rounded-md p-2"
            >
              <option value="TANPA">Tanpa</option>
              <option value="SATU_HARI">+1 Hari</option>
              <option value="DUA_HARI">+2 Hari</option>
            </select>
          </>
        )}

        <div className="flex justify-between pt-4">
          {isEditable && (
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Tiket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin mau hapus tiket ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini permanen, dan tiket akan hilang selamanya 🫠
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Hapus Sekarang
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleSave} disabled={saving}>
            Simpan Perubahan
          </Button>
        </div>
      </Card>
    </div>
  );
}
