"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Wilayah = { kode: string; nama: string };

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    provinsiId: "",
    kotaId: "",
    kecamatanId: "",
    kelurahanId: "",
    image: null as File | string | null,
  });

  const [loading, setLoading] = useState(true);
  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [kotaList, setKotaList] = useState<Wilayah[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);
  const [kelurahanList, setKelurahanList] = useState<Wilayah[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        const res = await fetch(`/api/user/${session.user.id}`);
        const data = await res.json();

        let provinsi = "", kota = "", kecamatan = "", kelurahan = "";
        if (data.wilayahId) {
          provinsi = data.wilayahId.substring(0, 2);
          kota = data.wilayahId.substring(0, 5);
          kecamatan = data.wilayahId.substring(0, 8);
          kelurahan = data.wilayahId;
        }

        setForm({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          provinsiId: provinsi,
          kotaId: kota,
          kecamatanId: kecamatan,
          kelurahanId: kelurahan,
          image: data.image || null,
        });

        if (provinsi) {
          const kotaData = await fetch(`/api/wilayah/kota?provinsiId=${provinsi}`).then(r => r.json());
          setKotaList(kotaData);
        }
        if (kota) {
          const kecData = await fetch(`/api/wilayah/kecamatan?kotaId=${kota}`).then(r => r.json());
          setKecamatanList(Array.isArray(kecData) ? kecData : kecData.data);
        }
        if (kecamatan) {
          const kelData = await fetch(`/api/wilayah/kelurahan?kecamatanId=${kecamatan}`).then(r => r.json());
          setKelurahanList(kelData);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Fetch provinsi awal
  useEffect(() => {
    fetch("/api/wilayah/provinsi")
      .then(res => res.json())
      .then(data => setProvinsiList(data));
  }, []);

  // Dynamic fetching on change
  useEffect(() => {
    if (form.provinsiId) {
      fetch(`/api/wilayah/kota?provinsiId=${form.provinsiId}`)
        .then(res => res.json())
        .then(data => setKotaList(data));
    }
  }, [form.provinsiId]);

  useEffect(() => {
    if (form.kotaId) {
      fetch(`/api/wilayah/kecamatan?kotaId=${form.kotaId}`)
        .then(res => res.json())
        .then(data => setKecamatanList(data));
    }
  }, [form.kotaId]);

  useEffect(() => {
    if (form.kecamatanId) {
      fetch(`/api/wilayah/kelurahan?kecamatanId=${form.kecamatanId}`)
        .then(res => res.json())
        .then(data => setKelurahanList(data));
    }
  }, [form.kecamatanId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("provinsiId", form.provinsiId);
    formData.append("kotaId", form.kotaId);
    formData.append("kecamatanId", form.kecamatanId);
    formData.append("kelurahanId", form.kelurahanId);
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    const res = await fetch(`/api/user/${session?.user?.id}`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      alert("Profil berhasil diperbarui!");
      router.refresh();
    } else {
      alert("Gagal memperbarui profil.");
    }
  };

  const imageUrl = form.image instanceof File
    ? URL.createObjectURL(form.image)
    : form.image || "/images/default-avatar.png";

  if (status === "loading" || loading) return <div className="p-4">Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md shadow-xl rounded-2xl border-none text-white">
        <CardHeader>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-2 relative">
            <img
              src={imageUrl}
              alt="Foto Profil"
              className="w-24 h-24 rounded-full object-cover ring-2 ring-white cursor-pointer"
              onClick={() => document.getElementById("upload-photo")?.click()}
            />
            <Input
              id="upload-photo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm((prev) => ({ ...prev, image: file }));
                }
              }}
              className="hidden"
            />
            <span className="text-xs text-gray-400">Klik foto untuk ganti</span>
          </div>

          <Separator className="bg-gray-700" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input nama */}
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama"
                className="bg-gray-800 text-white border-gray-600"
              />
            </div>

            {/* Input email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={form.email}
                readOnly
                className="bg-gray-800 text-gray-400 border-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Input phone */}
            <div>
              <Label htmlFor="phoneNumber">Nomor HP</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Nomor HP"
                className="bg-gray-800 text-white border-gray-600"
              />
            </div>

            <Separator className="bg-gray-700" />

            {/* Alamat */}
            <div className="space-y-2">
              <Label>Alamat</Label>

              {/* Pilihan Provinsi */}
              <Select
                onValueChange={(val) => setForm((prev) => ({ ...prev, provinsiId: val, kotaId: "", kecamatanId: "", kelurahanId: "" }))}
                value={form.provinsiId}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {provinsiList.map((prov) => (
                    <SelectItem key={prov.kode} value={prov.kode}>
                      {prov.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pilihan Kota */}
              <Select
                onValueChange={(val) => setForm((prev) => ({ ...prev, kotaId: val, kecamatanId: "", kelurahanId: "" }))}
                value={form.kotaId}
                disabled={!form.provinsiId}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Pilih Kota/Kabupaten" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {kotaList.map((kota) => (
                    <SelectItem key={kota.kode} value={kota.kode}>
                      {kota.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pilihan Kecamatan */}
              <Select
                onValueChange={(val) => setForm((prev) => ({ ...prev, kecamatanId: val, kelurahanId: "" }))}
                value={form.kecamatanId}
                disabled={!form.kotaId}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Pilih Kecamatan" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {kecamatanList.map((kec) => (
                    <SelectItem key={kec.kode} value={kec.kode}>
                      {kec.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pilihan Kelurahan */}
              <Select
                onValueChange={(val) => setForm((prev) => ({ ...prev, kelurahanId: val }))}
                value={form.kelurahanId}
                disabled={!form.kecamatanId}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Pilih Kelurahan/Desa" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {kelurahanList.map((kel) => (
                    <SelectItem key={kel.kode} value={kel.kode}>
                      {kel.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="pt-6">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Simpan Perubahan
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
