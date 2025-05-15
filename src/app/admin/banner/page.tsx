// Halaman Admin Kelola Banner dengan Upload Gambar + Edit Modal

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import ImageUpload from "@/app/components/admin/ImageUpload";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  urutan: number;
  startDate?: string;
  endDate?: string;
}

export default function KelolaBannerPage() {
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [urutan, setUrutan] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banner");
    const data = await res.json();
    setBannerList(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        imageUrl,
        link,
        isActive,
        urutan,
        startDate,
        endDate,
      }),
    });
    if (res.ok) {
      setTitle("");
      setImageUrl(null);
      setLink("");
      setUrutan(0);
      setIsActive(true);
      setStartDate(undefined);
      setEndDate(undefined);
      fetchBanner();
    } else {
      alert("❌ Gagal nambahin banner, coba lagi nanti yaa~");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin mau hapus banner ini?")) return;
    const res = await fetch(`/api/admin/banner/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchBanner();
  };

  const handleUpdate = async () => {
    if (!editBanner) return;
    const res = await fetch(`/api/admin/banner/${editBanner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editBanner),
    });
    if (res.ok) {
      setEditBanner(null);
      fetchBanner();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold text-white">🎨 Kelola Banner YUKNAWAR</h2>

      <form onSubmit={handleCreate} className="space-y-4 bg-gray-800/70 p-6 rounded-lg border border-gray-600">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">🎯 Judul Banner</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label className="text-white">📍 Link Tujuan</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div>
            <Label className="text-white">🔢 Urutan Tampil</Label>
            <Input type="number" value={urutan} onChange={(e) => setUrutan(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-white">Tampil di homepage?</Label>
          </div>
          <div className="col-span-2">
            <ImageUpload onChange={(val) => setImageUrl(val)} initialImage={imageUrl || undefined} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">⏱️ Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-white">⏳ Tanggal Berakhir</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 w-full mt-4">
          🚀 Tambah Banner Baru
        </Button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-white">⏳ Lagi loading banner...</p>
        ) : bannerList.length === 0 ? (
          <p className="text-gray-400">Belum ada banner. Yuk tambahin satu!</p>
        ) : (
          bannerList.map((b) => (
            <div key={b.id} className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-semibold text-base">🖼️ {b.title}</p>
                <p className="text-xs">🔗 {b.link || "(no link)"}</p>
                <p className="text-xs">📆 {b.startDate || "-"} – {b.endDate || "-"}</p>
                <p className="text-xs">📊 Urutan: {b.urutan} | 🚦 {b.isActive ? "Aktif ✅" : "Mati ❌"}</p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-xs"
                      onClick={() => setEditBanner(b)}
                    >
                      ✏️ Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit Banner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      <Label className="text-white">Judul</Label>
                      <Input
                        value={editBanner?.title || ""}
                        onChange={(e) =>
                          setEditBanner({ ...editBanner!, title: e.target.value })
                        }
                      />
                      <Label className="text-white">Link</Label>
                      <Input
                        value={editBanner?.link || ""}
                        onChange={(e) =>
                          setEditBanner({ ...editBanner!, link: e.target.value })
                        }
                      />
                      <Label className="text-white">Urutan</Label>
                      <Input
                        type="number"
                        value={editBanner?.urutan || 0}
                        onChange={(e) =>
                          setEditBanner({ ...editBanner!, urutan: Number(e.target.value) })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editBanner?.isActive}
                          onCheckedChange={(val) =>
                            setEditBanner({ ...editBanner!, isActive: val })
                          }
                        />
                        <Label className="text-white">Aktif</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleUpdate} className="bg-blue-600 text-white">
                        💾 Simpan Perubahan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" className="text-xs" onClick={() => handleDelete(b.id)}>
                  🗑️ Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}