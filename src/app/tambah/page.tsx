"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTicketPage() {
  const [konserList, setKonserList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [konserId, setKonserId] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [seat, setSeat] = useState("");
  const [tipeTempat, setTipeTempat] = useState("");
  const [harga_awal, setHargaAwal] = useState("");
  const [batas_waktu, setBatasWaktu] = useState("");
  const [harga_beli, setHargaBeliSekarang] = useState("");
  const [kelipatan, setHargaKelipatan] = useState("");
  const [perpanjangan_bid, setPerpanjanganBid] = useState("TANPA_PERPANJANGAN");
  const [deskripsi, setDeskripsi] = useState("");
  // Tambahkan ini di atas state konserId
  const [tipePenjualan, setTipePenjualan] = useState("LELANG");

  // const [perpanjanganWaktuBid, setPerpanjanganWaktuBid] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetch("/api/konser")
      .then((res) => res.json())
      //.then((data) => setKonserList(data));
      .then((data) => {
        console.log("Daftar konser dari API:", data);
        setKonserList(data);
      });
  }, []);

  useEffect(() => {
    if (konserId) {
      fetch(`/api/kategori?konserId=${konserId}`)
        .then((res) => res.json())
        .then((data) => setKategoriList(data));
    }
    console.log("Konser ID terpilih:", konserId);
  }, [konserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        konserId: parseInt(konserId),
        kategoriId: parseInt(kategoriId),
        seat,
        tipeTempat,
        harga_awal: parseInt(harga_awal),
        batas_waktu,
        harga_beli: harga_beli ? parseInt(harga_beli) : null,
        kelipatan: kelipatan ? parseInt(kelipatan) : null,
        perpanjangan_bid: perpanjangan_bid || null,
        deskripsi,
      }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const result = await res.json();
      alert("Gagal menambahkan lelang: " + result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Tambah Lelang Tiket</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Tambahkan di awal form sebelum konser */}
        <div>
          <label className="block mb-1">Tipe Penjualan</label>
          <select
            value={tipePenjualan}
            onChange={(e) => setTipePenjualan(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          >
            <option value="LELANG">Lelang</option>
            <option value="LANGSUNG">Jual Langsung</option>
          </select>
        </div>

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
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
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
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Tipe Tempat</label>
          <select
            value={tipeTempat}
            onChange={(e) => setTipeTempat(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          >
            <option value="">Pilih tipe tempat</option>
            <option value="duduk">Duduk (dengan seat)</option>
            <option value="berdiri">Berdiri (tanpa seat)</option>
            <option value="duduk acak">Duduk acak (tanpa seat)</option>
          </select>
        </div>

        {tipeTempat === "duduk" && (
          <div>
            <label className="block mb-1">Seat</label>
            <input
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block mb-1">Harga Jual Sekarang</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={harga_awal}
            onChange={(e) => setHargaAwal(e.target.value)}
            required
          />
        </div>


        <div>
          <label className="block mb-1">Harga Beli Sekarang (opsional)</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={harga_beli}
            onChange={(e) => setHargaBeliSekarang(e.target.value)}
          />
        </div>

       

        
        <div>
          <label className="block mb-1">Deskripsi</label>
          <textarea
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            required
          />
        </div>

        {tipePenjualan === "LELANG" && (
          <>
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

            <div>
              <label className="block mb-1">
                Kelipatan Penawaran (opsional)
              </label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={kelipatan}
                onChange={(e) => setHargaKelipatan(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1">Perpanjangan Waktu Bid</label>
              <select
                value={perpanjangan_bid}
                onChange={(e) => setPerpanjanganBid(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="TANPA_PERPANJANGAN">Tanpa Perpanjangan</option>
                <option value="SATU_HARI">1 x 24 jam</option>
                <option value="DUA_HARI">2 x 24 jam</option>
              </select>
            </div>
          </>
        )}

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
