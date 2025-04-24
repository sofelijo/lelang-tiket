'use client';

import { useState } from 'react';

export default function AddTicketForm() {
  const [mode, setMode] = useState<'jual' | 'lelang'>('jual');
  const [form, setForm] = useState({
    konserId: '',
    kategoriId: '',
    harga: '',
    deadline: '',
    perpanjanganWaktuBid: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dasar
    if (!form.konserId || !form.kategoriId || !form.harga) {
      return alert('Isi semua field wajib.');
    }
    if (mode === 'lelang' && (!form.deadline || !form.perpanjanganWaktuBid)) {
      return alert('Deadline dan perpanjangan wajib untuk mode lelang.');
    }

    const res = await fetch('/api/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mode }),
    });

    const data = await res.json();
    if (res.ok) alert('Tiket berhasil ditambahkan!');
    else alert('Gagal menambahkan: ' + data.message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-4 rounded text-white">
      <div>
        <label>Mode Penjualan:</label>
        <select name="mode" value={mode} onChange={(e) => setMode(e.target.value as 'jual' | 'lelang')} className="text-black w-full p-2 rounded">
          <option value="jual">Jual Langsung</option>
          <option value="lelang">Lelang</option>
        </select>
      </div>

      <input name="konserId" placeholder="ID Konser" onChange={handleChange} className="text-black w-full p-2 rounded" required />
      <input name="kategoriId" placeholder="ID Kategori" onChange={handleChange} className="text-black w-full p-2 rounded" required />
      <input name="harga" type="number" placeholder="Harga" onChange={handleChange} className="text-black w-full p-2 rounded" required />

      {mode === 'lelang' && (
        <>
          <input name="deadline" type="datetime-local" onChange={handleChange} className="text-black w-full p-2 rounded" required />
          <select name="perpanjanganWaktuBid" onChange={handleChange} className="text-black w-full p-2 rounded" required>
            <option value="">Pilih perpanjangan waktu</option>
            <option value="24_JAM">1x24 Jam</option>
            <option value="48_JAM">2x24 Jam</option>
          </select>
        </>
      )}

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Tambah Tiket</button>
    </form>
  );
}
