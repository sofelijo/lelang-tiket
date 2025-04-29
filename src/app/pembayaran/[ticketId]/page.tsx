/*
📁 Lokasi: /app/payment-v2/[ticketId]/page.tsx
*/

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import Image from "next/image";
import Link from "next/link";

const BANK = {
  nama: "Mandiri",
  rekening: "1234567890",
  atasNama: "Dhea Silvi",
};

const QRIS = {
  image: "/qris.png",
};

const ADMIN_PHONE = "6282143646463";

export default function PaymentV2Page() {
  const params = useParams();
  const ticketId =
    typeof params?.["ticketId"] === "string" ? params["ticketId"] : "";

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [metode, setMetode] = useState<"TRANSFER" | "QRIS_DINAMIS">("TRANSFER");
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [kodeUnik] = useState(Math.floor(100 + Math.random() * 900));
  const [countdown, setCountdown] = useState(600); // 10 menit dalam detik

  const hargaTiket = ticketInfo?.harga || 1000000;
  const fee =
    metode === "QRIS_DINAMIS"
      ? Math.ceil(hargaTiket * 0.04)
      : Math.ceil(hargaTiket * 0.03);
  const total = hargaTiket + fee + kodeUnik;

  useEffect(() => {
    setTicketInfo({
      id: ticketId,
      namaKonser: "Dewa 19",
      tanggal: "2025-06-01",
      jumlah: 1,
      tempat: "VIP A",
      seat: "A12",
    });
  }, [ticketId]);

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };
  const [timeLeft, setTimeLeft] = useState(600); // 10 menit = 600 detik

  // Saat pertama load, simpan waktu mulai ke localStorage
  useEffect(() => {
    const savedStart = localStorage.getItem("payment_start_time");
    const now = Date.now();

    if (savedStart) {
      const elapsed = Math.floor((now - parseInt(savedStart)) / 1000);
      const remaining = 600 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    } else {
      localStorage.setItem("payment_start_time", now.toString());
      setTimeLeft(600);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push("/"); // Kembali ke beranda
    }
  }, [timeLeft]);
  

  const whatsappMessage = `Halo admin, aku mau konfirmasi pembayaran ya!

ID Tiket: ${ticketId}
Konser: ${ticketInfo?.namaKonser}
Total Bayar: ${formatRupiah(total)}

Nama rekening pengirim: (tulis nama rekeningmu di sini)

Bukti transfer: (upload screenshot ya!)`;

  const whatsappLink = `https://api.whatsapp.com/send/?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {timeLeft > 0 ? (
        <div className="text-center text-sm text-red-500 font-semibold mb-2">
          ⏰ Selesaikan pembayaran dalam:{" "}
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      ) : (
        <div className="text-center text-sm text-red-600 font-bold mb-2">
          ❌ Waktu pembayaran habis. Silakan kembali dan mulai ulang.
        </div>
      )}

      <Stepper step={step} />
      <Separator className="my-4" />

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">1. Pilih Metode Pembayaran</h2>
          <div className="flex gap-4">
            <Button
              variant={metode === "TRANSFER" ? "default" : "outline"}
              onClick={() => setMetode("TRANSFER")}
              className="space-y-0.5"
            >
              <span>Transfer Bank (3%)</span>
              <span className="text-xs text-muted-foreground">fee 3%</span>
            </Button>
            <Button
              variant={metode === "QRIS_DINAMIS" ? "default" : "outline"}
              onClick={() => setMetode("QRIS_DINAMIS")}
            >
              QRIS (4%)
            </Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Lanjut</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">2. Pembayaran</h2>
          <div className="text-sm text-red-500 font-semibold">
            Waktu tersisa untuk bayar: {formatCountdown(countdown)}
          </div>
          {metode === "TRANSFER" ? (
            <>
              <div>Bank: {BANK.nama}</div>
              <div>Rekening: {BANK.rekening}</div>
              <div>Atas Nama: {BANK.atasNama}</div>
            </>
          ) : (
            <Image src={QRIS.image} alt="QRIS" width={250} height={250} />
          )}
          <Separator />
          <div className="text-sm">
            <div>Harga Tiket: {formatRupiah(hargaTiket)}</div>
            <div>Fee Platform: {formatRupiah(fee)}</div>
            <div>Kode Unik: {kodeUnik}</div>
            <div className="font-bold mt-2">Total: {formatRupiah(total)}</div>
          </div>
          <Separator />
          <div className="text-sm">
            <div>🎤 {ticketInfo?.namaKonser}</div>
            <div>📅 {ticketInfo?.tanggal}</div>
            <div>
              🎫 {ticketInfo?.jumlah} Tiket - {ticketInfo?.tempat} (
              {ticketInfo?.seat})
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button onClick={() => setStep(3)}>Lanjut</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">3. Konfirmasi Pembayaran</h2>
          <p className="text-sm">
            Klik tombol di bawah untuk konfirmasi via WhatsApp.
          </p>
          <Link href={whatsappLink} target="_blank">
            <Button className="w-full">Konfirmasi via WhatsApp</Button>
          </Link>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              Kembali
            </Button>
            <Button onClick={() => setStep(4)}>Saya Sudah Bayar</Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6 space-y-4 text-center">
          <h2 className="text-xl font-bold">4. Menunggu Konfirmasi</h2>
          <p className="text-sm">
            Pembayaranmu sedang diproses. Mohon tunggu maksimal 10 menit.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Kembali ke Beranda
          </Button>
        </Card>
      )}
    </div>
  );
}
