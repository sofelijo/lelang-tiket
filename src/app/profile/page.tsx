"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // Ambil data user
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then((res) => res.json())
        .then(async (data) => {
          let provinsi = "", kota = "", kecamatan = "", kelurahan = "";

          if (data.wilayahId) {
            provinsi = data.wilayahId.substring(0, 2);
            if (data.wilayahId.length > 2) kota = data.wilayahId.substring(0, 5);
            if (data.wilayahId.length > 5) kecamatan = data.wilayahId.substring(0, 8);
            if (data.wilayahId.length > 8) kelurahan = data.wilayahId;
          }

          setForm({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            provinsiId: provinsi,
            kotaId: kota,
            kecamatanId: kecamatan,
            kelurahanId: kelurahan,
            image: data.image || null, // Bisa jadi string atau null
          });

          // Load wilayah data
          if (provinsi) {
            const kotaData = await (await fetch(`/api/wilayah/kota?provinsiId=${provinsi}`)).json();
            setKotaList(kotaData);
          }

          if (kota) {
            const kecData = await (await fetch(`/api/wilayah/kecamatan?kotaId=${kota}`)).json();
            setKecamatanList(Array.isArray(kecData) ? kecData : kecData.data);
          }

          if (kecamatan) {
            const kelData = await (await fetch(`/api/wilayah/kelurahan?kecamatanId=${kecamatan}`)).json();
            setKelurahanList(kelData);
          }

          setLoading(false);
        });
    }
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
    } else {
      setKotaList([]);
      setForm((prev) => ({
        ...prev,
        kotaId: "",
        kecamatanId: "",
        kelurahanId: "",
      }));
    }
  }, [form.provinsiId]);

  useEffect(() => {
    if (form.kotaId) {
      fetch(`/api/wilayah/kecamatan?kotaId=${form.kotaId}`)
        .then((res) => res.json())
        .then((data) => setKecamatanList(data));
    } else {
      setKecamatanList([]);
      setForm((prev) => ({ ...prev, kecamatanId: "", kelurahanId: "" }));
    }
  }, [form.kotaId]);

  useEffect(() => {
    if (form.kecamatanId) {
      fetch(`/api/wilayah/kelurahan?kecamatanId=${form.kecamatanId}`)
        .then((res) => res.json())
        .then((data) => setKelurahanList(data));
    } else {
      setKelurahanList([]);
      setForm((prev) => ({ ...prev, kelurahanId: "" }));
    }
  }, [form.kecamatanId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      alert("Profil berhasil diperbarui");
      router.refresh(); // Refresh halaman untuk memuat gambar terbaru
    } else {
      alert("Gagal memperbarui profil");
    }
  };

  const imageUrl =
  form.image instanceof File
    ? URL.createObjectURL(form.image)
    : form.image
    ? form.image // ✅ langsung pakai
    : "/images/default-avatar.png";


  if (status === "loading" || loading)
    return <div className="p-4">Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

      <img
        src={imageUrl}
        alt="Foto Profil"
        className="w-24 h-24 rounded-full object-cover mb-2"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setForm((prev) => ({ ...prev, image: file }));
            }
          }}
          className="w-full border p-2 rounded"
        />

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nama"
        />
        <input
          name="email"
          value={form.email}
          readOnly
          className="w-full border p-2 bg-gray-100 rounded"
        />
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nomor HP"
        />

        {/* Select wilayah (provinsi -> kelurahan) */}
        <select
          name="provinsiId"
          value={form.provinsiId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinsiList.map((prov) => (
            <option key={prov.kode} value={prov.kode}>
              {prov.nama}
            </option>
          ))}
        </select>

        <select
          name="kotaId"
          value={form.kotaId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={!form.provinsiId}
        >
          <option value="">-- Pilih Kota/Kabupaten --</option>
          {kotaList.map((kota) => (
            <option key={kota.kode} value={kota.kode}>
              {kota.nama}
            </option>
          ))}
        </select>

        <select
          name="kecamatanId"
          value={form.kecamatanId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={!form.kotaId}
        >
          <option value="">-- Pilih Kecamatan --</option>
          {kecamatanList.map((kec) => (
            <option key={kec.kode} value={kec.kode}>
              {kec.nama}
            </option>
          ))}
        </select>

        <select
          name="kelurahanId"
          value={form.kelurahanId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={!form.kecamatanId}
        >
          <option value="">-- Pilih Kelurahan/Desa --</option>
          {kelurahanList.map((kel) => (
            <option key={kel.kode} value={kel.kode}>
              {kel.nama}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
