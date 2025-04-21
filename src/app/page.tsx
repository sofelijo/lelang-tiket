// app/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Ticket = {
  id: number
  seat: string
  tipeTempat: string
  harga_awal: number
  batas_waktu: string
  konser: {
    nama: string
    lokasi: string
    tanggal: string
  }
  kategori: {
    nama: string
  }
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ticket')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Gagal mengambil data tiket')
        }
        return res.json()
      })
      .then((data) => setTickets(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mt-8 mb-4">
        <h1 className="text-2xl font-bold text-white">Daftar Lelang Tiket</h1>
        <a
          href="/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          Tambahkan Lelang
        </a>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : tickets.length === 0 ? (
        <p>Tidak ada tiket tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-800 text-white p-4 rounded-xl shadow-md transition hover:scale-105"
            >
              <h2 className="text-xl font-semibold mb-2">{ticket.konser.nama}</h2>
              <p className="text-sm text-gray-300">Lokasi: {ticket.konser.lokasi}</p>
              <p className="text-sm text-gray-300">Tanggal: {new Date(ticket.konser.tanggal).toLocaleDateString()}</p>
              <p className="text-sm text-gray-300">Kategori: {ticket.kategori.nama}</p>
              <p className="text-sm text-gray-300">Seat: {ticket.seat} ({ticket.tipeTempat})</p>
              <p className="text-sm text-gray-300">Harga Awal: Rp{ticket.harga_awal.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Batas Waktu: {new Date(ticket.batas_waktu).toLocaleString()}</p>
              <button
                onClick={() => window.open(`/ticket/${ticket.id}`, "_blank")}
                className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Tawar Sekarang
              </button>
            </div>
          ))}
        </div>

      )}
    </main>
  )
}
