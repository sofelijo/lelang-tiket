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
  });

  const [loading, setLoading] = useState(true);

  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [kotaList, setKotaList] = useState<Wilayah[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);
  const [kelurahanList, setKelurahanList] = useState<Wilayah[]>([]);

  // Ambil data profil user
  // Ambil data profil user
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then((res) => res.json())
        .then(async (data) => {
          let userProvinsiKode = "";
          let userKotaKode = "";
          let userKecamatanKode = "";
          let userKelurahanKode = "";

          if (data.wilayahId) {
            userProvinsiKode = data.wilayahId.substring(0, 2);
            if (data.wilayahId.length > 2) {
              userKotaKode = data.wilayahId.substring(0, 5);
            }
            if (data.wilayahId.length > 5) {
              userKecamatanKode = data.wilayahId.substring(0, 8);
            }
            if (data.wilayahId.length > 8) {
              userKelurahanKode = data.wilayahId;
            }
          }
          
          console.log("Kode Provinsi User:", userProvinsiKode);
          setForm({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            provinsiId: userProvinsiKode, // 👈 Bagian ini mengatur kode provinsi pengguna
            kotaId: userKotaKode,
            kecamatanId: userKecamatanKode,
            kelurahanId: userKelurahanKode,
          });

          console.log("form.provinsiId setelah di-set:", form.provinsiId);
          // Bagian lain dari useEffect ini mengambil data kota, kecamatan, dan kelurahan berdasarkan kode wilayah pengguna.
          if (userProvinsiKode) {
            const kotaRes = await fetch(
              `/api/wilayah/kota?provinsiId=${userProvinsiKode}`
            );
            const kotaData = await kotaRes.json();
            setKotaList(kotaData);
          }

          if (userKotaKode) {
            const kecRes = await fetch(
              `/api/wilayah/kecamatan?kotaId=${userKotaKode}`
            );
            const kecData = await kecRes.json();
            console.log("Cek response kecamatan:", kecData); // Debug log
            setKecamatanList(Array.isArray(kecData) ? kecData : kecData.data); // ✅ Ambil array-nya saja
          }

          if (userKecamatanKode) {
            const kelRes = await fetch(
              `/api/wilayah/kelurahan?kecamatanId=${userKecamatanKode}`
            );
            const kelData = await kelRes.json();
            setKelurahanList(kelData);
          }

          setLoading(false);
        });
    }
  }, [session]);

  // Ambil data provinsi
  useEffect(() => {
    fetch("/api/wilayah/provinsi")
      .then((res) => res.json())
      .then((data) => setProvinsiList(data));
  }, []);

  // Ambil data kota saat provinsi berubah
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

  // Ambil kecamatan saat kota berubah
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

  // Ambil kelurahan saat kecamatan berubah
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
    const res = await fetch(`/api/user/${session?.user?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Profil berhasil diperbarui");
    } else {
      alert("Gagal memperbarui profil");
    }
  };

  if (status === "loading" || loading)
    return <div className="p-4">Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
