// src/app/ticket/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!id) return;
  
    fetch(`/api/ticket/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal ambil data tiket');
        return res.json();
      })
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Data tiket tidak ditemukan.');
        setLoading(false);
      });
  }, [id]);
  

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, amount: parseInt(amount) }),
    });
    const data = await res.json();
    if (res.ok) {
      setTicket(prev => ({ ...prev, bids: [data, ...prev.bids] }));
      setAmount('');
    } else {
      alert('Gagal menawar: ' + data.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      {/* ✅ Tampilkan pesan error jika ada */}
      {error && (
        <p className="mb-4 text-red-500 font-semibold">{error}</p>
      )}
  
      {/* ✅ Jika tidak error, tampilkan detail tiket */}
      {!error && (
        <>
          <h1 className="text-3xl font-bold mb-4">
            {ticket.konser.nama} - {ticket.kategori.nama}
          </h1>
          <p className="mb-2">Tempat: {ticket.konser.tempat}</p>
          <p className="mb-2">Tanggal: {ticket.konser.tanggal}</p>
          <p className="mb-4">Harga Awal: Rp{ticket.harga_awal}</p>
  
          <form onSubmit={handleBid} className="mb-6">
            <label className="block mb-2">Tawar Harga</label>
            <input
              type="number"
              className="p-2 rounded bg-gray-700 text-white w-full mb-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              type="submit"
            >
              Tawar Sekarang
            </button>
          </form>
  
          <h2 className="text-xl font-semibold mb-2">Riwayat Penawaran</h2>
          {ticket.bids.length === 0 ? (
            <p>Belum ada penawaran.</p>
          ) : (
            <ul className="space-y-2">
              {ticket.bids.map((bid: any, i: number) => (
                <li key={i} className="p-2 bg-gray-800 rounded">
                  Rp{bid.amount} oleh {bid.user?.name ?? 'Pengguna'}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
  
}
