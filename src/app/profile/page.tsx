"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";

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
    username: "",
  });

  const [loading, setLoading] = useState(true);
  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [kotaList, setKotaList] = useState<Wilayah[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);
  const [kelurahanList, setKelurahanList] = useState<Wilayah[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        const res = await fetch(`/api/user/${session.user.id}`);
        const data = await res.json();

        let provinsi = "",
          kota = "",
          kecamatan = "",
          kelurahan = "";
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
          username: data.username || "",
        });

        setIsVerified(!!data.phoneVerified);

        if (provinsi) {
          const kotaData = await fetch(
            `/api/wilayah/kota?provinsiId=${provinsi}`
          ).then((r) => r.json());
          setKotaList(kotaData);
        }
        if (kota) {
          const kecData = await fetch(
            `/api/wilayah/kecamatan?kotaId=${kota}`
          ).then((r) => r.json());
          setKecamatanList(Array.isArray(kecData) ? kecData : kecData.data);
        }
        if (kecamatan) {
          const kelData = await fetch(
            `/api/wilayah/kelurahan?kecamatanId=${kecamatan}`
          ).then((r) => r.json());
          setKelurahanList(kelData);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    fetch("/api/wilayah/provinsi")
      .then((res) => res.json())
      .then((data) => setProvinsiList(data));
  }, []);

  useEffect(() => {
    if (form.provinsiId) {
      fetch(`/api/wilayah/kota?provinsiId=${form.provinsiId}`)
        .then((res) => res.json())
        .then((data) => setKotaList(data));
    }
  }, [form.provinsiId]);

  useEffect(() => {
    if (form.kotaId) {
      fetch(`/api/wilayah/kecamatan?kotaId=${form.kotaId}`)
        .then((res) => res.json())
        .then((data) => setKecamatanList(data));
    }
  }, [form.kotaId]);

  useEffect(() => {
    if (form.kecamatanId) {
      fetch(`/api/wilayah/kelurahan?kecamatanId=${form.kecamatanId}`)
        .then((res) => res.json())
        .then((data) => setKelurahanList(data));
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
    } else if (typeof form.image === "string") {
      formData.append("imageUrl", form.image); // ⬅️ Tambahkan ini
    }

    const res = await fetch(`/api/user/${session?.user?.id}`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      alert("Profil kamu udah di-update 💅");
      router.refresh();
    } else {
      alert("Oops, gagal update profil 😢");
    }
  };

  const imageUrl =
    form.image instanceof File
      ? URL.createObjectURL(form.image)
      : form.image || "/images/default-avatar.png";

  if (status === "loading" || loading)
    return <div className="p-4">Loading dulu yaa...</div>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // ... (import, session, useState, useEffect, dll tetap sama)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <ProfileSidebar isVerified={isVerified} />

      <div className="flex-1">
        <Card className="bg-white shadow-xl rounded-2xl border border-border text-gray-800">
          <CardHeader className="text-center">
            <p className="text-2xl font-bold"></p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* FORM KOLOM KIRI */}
              <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold text-center">🧑‍💼 Data Diri Kamu</h1>
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukin nama kamu ya"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="cursor-not-allowed text-muted-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    readOnly
                    className="cursor-not-allowed text-muted-foreground"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Alamat Domisili</Label>

                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        provinsiId: val,
                        kotaId: "",
                        kecamatanId: "",
                        kelurahanId: "",
                      }))
                    }
                    value={form.provinsiId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinsiList.map((prov) => (
                        <SelectItem key={prov.kode} value={prov.kode}>
                          {prov.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        kotaId: val,
                        kecamatanId: "",
                        kelurahanId: "",
                      }))
                    }
                    value={form.kotaId}
                    disabled={!form.provinsiId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kota/Kabupaten" />
                    </SelectTrigger>
                    <SelectContent>
                      {kotaList.map((kota) => (
                        <SelectItem key={kota.kode} value={kota.kode}>
                          {kota.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        kecamatanId: val,
                        kelurahanId: "",
                      }))
                    }
                    value={form.kecamatanId}
                    disabled={!form.kotaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kecamatanList.map((kec) => (
                        <SelectItem key={kec.kode} value={kec.kode}>
                          {kec.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, kelurahanId: val }))
                    }
                    value={form.kelurahanId}
                    disabled={!form.kecamatanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelurahan/Desa" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelurahanList.map((kel) => (
                        <SelectItem key={kel.kode} value={kel.kode}>
                          {kel.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <CardFooter className="pt-6">
                  <Button type="submit" className="w-full">
                    🚀 Simpan Perubahan
                  </Button>
                </CardFooter>
              </form>

             
              {/* FOTO KOLOM KANAN */}
              <div className="flex flex-col items-center gap-2 w-full md:w-80">
                <p className="text-sm text-muted-foreground mb-1">
                  @{form.username || "username"}
                </p>

                <img
                  src={imageUrl}
                  alt="Foto Profil"
                  className="w-24 h-24 rounded-xl object-cover ring-2 ring-primary cursor-pointer"
                  onClick={() =>
                    document.getElementById("upload-photo")?.click()
                  }
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
                <span className="text-xs text-muted-foreground text-center mb-2">
                  Klik foto untuk upload 📸
                </span>

                {/* Pilihan Avatar Default (4 kolom x 5 baris, total 20) */}
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const src = `/images/default-avatar${i + 1}.png`;
                    return (
                      <img
                        key={i}
                        src={src}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, image: src }))
                        }
                        className={`w-16 h-16 object-cover rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                          form.image === src
                            ? "border-primary ring-2 ring-primary"
                            : "border-gray-300"
                        }`}
                        alt={`Avatar ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
