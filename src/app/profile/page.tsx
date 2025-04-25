'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter(); 
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
          });
          setLoading(false);
        });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/user/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert('Profil berhasil diperbarui');
    } else {
      alert('Gagal memperbarui profil');
    }
  };

  // Penanganan status session
  if (status === 'loading' || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
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





// 'use client';

// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';

// export default function ProfileForm() {

   
//   const { register, setValue, watch } = useForm();

//   type Wilayah = {
// kode: string;
//     nama: string;
//   };
  
//   const [provinsi, setProvinsi] = useState<Wilayah[]>([]);
//   const [kota, setKota] = useState<Wilayah[]>([]);
//   const [kecamatan, setKecamatan] = useState<Wilayah[]>([]);
//   const [kelurahan, setKelurahan] = useState<Wilayah[]>([]);
  

//   const selectedProvinsi = watch('provinsiId');
//   const selectedKota = watch('kotaId');
//   const selectedKecamatan = watch('kecamatanId');

//   // Fetch Provinsi
//   useEffect(() => {
//     axios.get('/api/wilayah/provinsi').then((res) => {
//       setProvinsi(res.data);
//     });
//   }, []);

//   // Fetch Kota berdasarkan provinsi
//   useEffect(() => {
//     if (selectedProvinsi) {
//       axios.get(`/api/wilayah/kota?provinsiId=${selectedProvinsi}`).then((res) => {
//         setKota(res.data);
//         setKecamatan([]); // reset child
//         setKelurahan([]);
//         setValue('kotaId', '');
//         setValue('kecamatanId', '');
//         setValue('kelurahanId', '');
//       });
//     }
//   }, [selectedProvinsi]);

//   // Fetch Kecamatan berdasarkan kota
//   useEffect(() => {
//     if (selectedKota) {
//       axios.get(`/api/wilayah/kecamatan?kotaId=${selectedKota}`).then((res) => {
//         setKecamatan(res.data);
//         setKelurahan([]);
//         setValue('kecamatanId', '');
//         setValue('kelurahanId', '');
//       });
//     }
//   }, [selectedKota]);

//   // Fetch Kelurahan berdasarkan kecamatan
//   useEffect(() => {
//     if (selectedKecamatan) {
//       axios.get(`/api/wilayah/kelurahan?kecamatanId=${selectedKecamatan}`).then((res) => {
//         setKelurahan(res.data);
//         setValue('kelurahanId', '');
//       });
//     }
//   }, [selectedKecamatan]);

//   return (
//     <form>
//       {/* Provinsi */}
//       <label>Provinsi</label>
//       <select {...register('provinsiId')} className="border p-2 rounded w-full">
//         <option value="">Pilih Provinsi</option>
//         {provinsi.map((p) => (
//           <option key={p.kode} value={p.kode}>{p.nama}</option>
//         ))}
//       </select>

//       {/* Kota */}
//       <label className="mt-4">Kota / Kabupaten</label>
//       <select {...register('kotaId')} className="border p-2 rounded w-full" disabled={!selectedProvinsi}>
//         <option value="">Pilih Kota</option>
//         {kota.map((k) => (
//           <option key={k.id} value={k.id}>{k.nama}</option>
//         ))}
//       </select>

//       {/* Kecamatan */}
//       <label className="mt-4">Kecamatan</label>
//       <select {...register('kecamatanId')} className="border p-2 rounded w-full" disabled={!selectedKota}>
//         <option value="">Pilih Kecamatan</option>
//         {kecamatan.map((k) => (
//           <option key={k.id} value={k.id}>{k.nama}</option>
//         ))}
//       </select>

//       {/* Kelurahan */}
//       <label className="mt-4">Kelurahan</label>
//       <select {...register('kelurahanId')} className="border p-2 rounded w-full" disabled={!selectedKecamatan}>
//         <option value="">Pilih Kelurahan</option>
//         {kelurahan.map((kel) => (
//           <option key={kel.id} value={kel.id}>{kel.nama}</option>
//         ))}
//       </select>

//       {/* Tombol Submit */}
//       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
//         Simpan
//       </button>
//     </form>
//   );
// }

