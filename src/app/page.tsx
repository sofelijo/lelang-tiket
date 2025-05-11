"use client";

import { useEffect, useState } from "react";
import Banner from "@/app/components/lainnya/Banner";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import HeroSection from "@/app/components/lainnya/HeroSection";

// 🔢 Komponen animasi harga
function AnimatedPrice({ amount }: { amount: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / 800, 1);
      const current = Math.floor(progress * amount);
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [amount]);

  return <>Rp {value.toLocaleString()}</>;
}

// Tipe data
type Ticket = {
  id: number;
  seat: string;
  tipeTempat: string;
  harga_awal: number;
  batas_waktu: string;
  konser: {
    nama: string;
    lokasi: string;
    tanggal: string;
  };
  kategori: {
    nama: string;
  };
};

type Konser = {
  id: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  venue: string;
  image: string;
  jumlahTiket: number;
};

type TopTicket = {
  id: number;
  harga_terkini: number;
  jumlah: number; // ✅ ini penting
  seat: string;
  tipeTempat: string;
  jumlahBid: number;
  batas_waktu: string;
  konser: {
    id: number;
    nama: string;
    lokasi: string;
    tanggal: string;
    image: string;
  };
  kategori: {
    id: number;
    nama: string;
  };
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [topKonser, setTopKonser] = useState<Konser[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [topTickets, setTopTickets] = useState<TopTicket[]>([]);
  const [loadingTopTickets, setLoadingTopTickets] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/ticket")
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/top-konser")
      .then((res) => res.json())
      .then((data) => setTopKonser(data))
      .catch(console.error)
      .finally(() => setLoadingTop(false));

    fetch("/api/top-ticket")
      .then((res) => res.json())
      .then((data) => {
        setTopTickets(data);
        const initialCountdowns: Record<number, string> = {};
        data.forEach((ticket: TopTicket) => {
          initialCountdowns[ticket.id] = formatCountdown(
            new Date(ticket.batas_waktu).getTime() - Date.now()
          );
        });
        setCountdowns(initialCountdowns);
      })
      .catch(console.error)
      .finally(() => setLoadingTopTickets(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated: Record<number, string> = {};
        topTickets.forEach((ticket) => {
          const diff =
            new Date(ticket.batas_waktu).getTime() - new Date().getTime();
          updated[ticket.id] = formatCountdown(diff);
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [topTickets]);

  function formatCountdown(ms: number): string {
    if (ms <= 0) return "00:00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function pad(num: number): string {
    return num.toString().padStart(2, "0");
  }

  const containerVariant = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="pt-0 px-0">
      <div className="p-0">
        <Banner />
      </div>

      {/* 🔥 Top Konser */}
      <section className="px-4 py-6 space-y-4">
        <div className="w-full text-center py-6">
          <h2 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
            🔥 Top Konser
          </h2>
          <p className="text-sm text-zinc-300 mt-1">
            Konser yang lagi rame banget, jangan sampe kehabisan 🎟️
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          variants={containerVariant}
          initial="hidden"
          animate="show"
        >
          {loadingTop
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-60 rounded-xl animate-pulse bg-zinc-200 dark:bg-zinc-800"
                />
              ))
            : topKonser.slice(0, 8).map((k) => (
                <motion.div key={k.id} variants={itemVariant}>
                  <Link href={`/konser/${k.id}`}>
                    <Card className="group overflow-hidden rounded-xl border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-xl transition-all hover:scale-[1.02] duration-300">
                      <div className="w-full h-56 relative">
                        <Image
                          src={k.image || "/placeholder.jpg"}
                          alt={k.nama}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Badge jumlah tiket */}
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-md">
                          🎟️ {k.jumlahTiket} tiket
                        </div>

                        {/* Badge trending */}
                        {k.jumlahTiket > 10 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-md">
                            🔥 Trending
                          </div>
                        )}

                        {/* Title muncul saat hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-4 text-center">
                          <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2">
                            {k.nama}
                          </h3>
                        </div>
                      </div>

                      <div className="absolute bottom-0 w-full px-3 py-2 text-white text-xs bg-gradient-to-t from-black/70 via-black/40 to-transparent ">
                        📍 {k.venue}, {k.lokasi}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </motion.div>
      </section>

      {/* 💥 Tiket Paling Diburu */}
      <section className="px-4 py-6 space-y-4">
        <div className="w-full text-center py-6">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent animate-pulse">
            💥 Tiket Paling Diburu
          </h2>
          <p className="text-sm text-zinc-300 mt-1">
            Persaingan ketat! Lelangnya rame banget 🧨 siapa cepat dia dapet.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {loadingTopTickets
            ? Array.from({ length: 16 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))
            : topTickets.slice(0, 16).map((ticket) => (
                <Link href={`/ticket/${ticket.id}`} key={ticket.id}>
                 <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  <Card className="group overflow-hidden rounded-xl border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-xl hover:scale-[1.02] transition-transform duration-500">
    <div className="w-full h-28 relative">
      {/* Gambar */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={ticket.konser.image || "/placeholder.jpg"}
          alt={ticket.konser.nama}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Countdown & Bid */}
      <motion.div
        className="absolute top-0 w-full flex justify-between items-center bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white text-[10px] px-2 py-1 z-30"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span>⏰ {countdowns[ticket.id] || "00:00:00:00"}</span>
        <span>🔥 {ticket.jumlahBid} bid</span>
      </motion.div>

      {/* Badge kategori & harga */}
      <div
        className="absolute bottom-2 left-2 flex flex-col items-start gap-1 z-20 transition-all duration-500 group-hover:translate-y-3 group-hover:opacity-0"
      >
        <div className="bg-indigo-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
          {ticket.kategori.nama}
        </div>
        <div className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
          <AnimatedPrice
            amount={Math.floor(
              ticket.harga_terkini / (ticket.jumlah * 1.03 || 1)
            )}
          />
        </div>
      </div>

      {/* Nama konser - fade + slide in saat hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
        <h3 className="text-white text-xs sm:text-sm font-semibold text-center px-4 py-1 line-clamp-2">
          {ticket.konser.nama}
        </h3>
      </div>
    </div>
  </Card>
</motion.div>

                </Link>
              ))}
        </div>
      </section>
    </main>
  );
}
