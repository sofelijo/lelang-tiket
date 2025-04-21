'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTicketPage() {
  const [konserList, setKonserList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  const [konserId, setKonserId] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [seat, setSeat] = useState('');
  const [tipeTempat, setTipeTempat] = useState('');
  const [harga_awal, setHargaAwal] = useState('');
  const [batas_waktu, setBatasWaktu] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/konser')
      .then(res => res.json())
      .then(data => setKonserList(data));
  }, []);

  useEffect(() => {
    if (konserId) {
      fetch(`/api/kategori?konserId=${konserId}`)
        .then(res => res.json())
        .then(data => setKategoriList(data));
    }
  }, [konserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        konserId: parseInt(konserId),
        kategoriId: parseInt(kategoriId),
        seat,
        tipeTempat,
        harga_awal: parseInt(harga_awal),
        batas_waktu,
      }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const result = await res.json();
      alert('Gagal menambahkan lelang: ' + result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Tambah Lelang Tiket</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Konser</label>
          <select
            value={konserId}
            onChange={(e) => setKonserId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          >
            <option value="">Pilih konser</option>
            {konserList.map((k: any) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Kategori</label>
          <select
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          >
            <option value="">Pilih kategori</option>
            {kategoriList.map((k: any) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Seat</label>
          <input
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Tipe Tempat</label>
          <input
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={tipeTempat}
            onChange={(e) => setTipeTempat(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Harga Awal</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={harga_awal}
            onChange={(e) => setHargaAwal(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Batas Waktu</label>
          <input
            type="datetime-local"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={batas_waktu}
            onChange={(e) => setBatasWaktu(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
