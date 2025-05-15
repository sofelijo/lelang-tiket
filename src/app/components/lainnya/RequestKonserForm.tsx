"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

interface RequestKonser {
  id: number;
  nama: string;
  lokasi: string;
  venue?: string;
  tanggal?: string;
  deskripsi?: string;
  kategoriIds?: number[];
  kategoriList?: { id: number; nama: string }[];
  likes: { id: number }[];
}

export default function RequestKonserPage() {
  const [form, setForm] = useState({ nama: "", lokasi: "", venue: "", deskripsi: "" });
  const [tanggal, setTanggal] = useState<Date | undefined>(undefined);
  const [kategoriOptions, setKategoriOptions] = useState<{ id: number; nama: string }[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<{ id: number; nama: string }[]>([]);
  const [list, setList] = useState<RequestKonser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<RequestKonser | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMore = async () => {
    setLoading(true);
    const res = await fetch(`/api/request-konser?page=${page}`);
    const data = await res.json();
    setList((prev) => [...prev, ...data]);
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/request-konser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tanggal, kategoriIds: selectedKategori.map((k) => k.id) }),
    });
    if (res.ok) {
      const newReq = await res.json();
      setList((prev) => [newReq, ...prev]);
      setForm({ nama: "", lokasi: "", venue: "", deskripsi: "" });
      setTanggal(undefined);
      setSelectedKategori([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleLike = async (id: number) => {
    await fetch("/api/request-konser/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestKonserId: id }),
    });
    setList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes: [...item.likes, { id: Date.now() }] } : item
      )
    );
  };

  useEffect(() => {
    fetchMore();
    fetch("/api/kategori/all")
      .then((res) => res.json())
      .then((data) => setKategoriOptions(data));
  }, []);

  const handleScroll = () => {
    const el = listRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && !loading) {
      fetchMore();
    }
  };

  const filteredKategori =
  searchTerm.length >= 2
    ? kategoriOptions.filter((k) => k.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <main className="max-w-screen-xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-black">🎤 Request Konser</h2>
          {success && <div className="text-green-600">Request berhasil dikirim!</div>}

          <div className="space-y-1">
            <Label className="text-black">Nama Konser</Label>
            <Input
              className="text-black"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: BLACKPINK BORN PINK"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-black">Lokasi</Label>
            <Input
              className="text-black"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="Jakarta, Bandung, Bali..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-black">Venue (opsional)</Label>
            <Input
              className="text-black"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="GBK, ICE BSD..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-black">Tanggal Konser</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left text-black">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggal ? format(tanggal, "dd MMM yyyy") : "Pilih tanggal konser"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label>Kategori Tiket</Label>
            <Combobox
              options={filteredKategori}
              selected={selectedKategori}
              setSelected={setSelectedKategori}
              placeholder="Pilih kategori seperti VVIP, VIP, Festival..."
              allowMultiple
              onInputChange={setSearchTerm}
            />
          </div>


          <div className="space-y-1">
            <Label className="text-black">Deskripsi</Label>
            <Textarea
              className="text-black"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Kenapa konser ini penting banget buat kamu?"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="mt-4 w-full">
          Kirim Request 🎟️
        </Button>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-xl p-6 shadow-md h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-black">🔥 Konser yang Lagi Di-request</h2>
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="overflow-y-auto space-y-3 flex-1 pr-2"
        >
          {list.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/20">
              <div className="font-semibold text-black">{item.nama}</div>
              <div className="text-xs text-muted-foreground mb-2">
                Jumlah dukungan: {item.likes.length}
              </div>
              <div className="flex gap-2">
                <Button className="text-black"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDetail(item)}
                >
                  Detail
                </Button>
                <Button className="text-black" variant="ghost" size="sm" onClick={() => handleLike(item.id)}>
                  ❤️ Dukung
                </Button>
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-center text-muted-foreground py-4">Loading...</div>}
        </div>
      </div>

      {/* Modal Detail */}
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-black">Detail Request Konser</DialogTitle>
          {selectedDetail && (
            <div className="text-sm space-y-1">
              <div className="text-black"><strong>Nama:</strong> {selectedDetail.nama}</div>
              <div className="text-black"><strong>Lokasi:</strong> {selectedDetail.lokasi}</div>
              <div className="text-black"><strong>Venue:</strong> {selectedDetail.venue || "-"}</div>
              <div className="text-black"><strong>Tanggal:</strong> {selectedDetail.tanggal || "-"}</div>
              <div className="text-black"><strong>Kategori:</strong> {(selectedKategori.map(k => k.nama).join(", ")) || "-"}</div>
              <div className="text-black"><strong>Deskripsi:</strong> {selectedDetail.deskripsi || "-"}</div>
              <div className="text-black"><strong>Likes:</strong> {selectedDetail.likes.length}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
