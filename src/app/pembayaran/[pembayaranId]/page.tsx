"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "@/components/payment/Stepper";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";


const BANK = {
  nama: "Mandiri",
  rekening: "1234567890",
  atasNama: "Dhea Silvi",
};

const QRIS = {
  image: "/qris.png",
};

const ADMIN_PHONE = "6282143646463";

export default function PaymentPage() {
  const params = useParams();
  const pembayaranId =
    typeof params?.["pembayaranId"] === "string" ? params["pembayaranId"] : "";

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [metode, setMetode] = useState<
    "TRANSFER" | "QRIS_DINAMIS" | "MIDTRANS"
  >("TRANSFER");
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [kodeUnik, setKodeUnik] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [snapToken, setSnapToken] = useState<string | null>(null);

  const [selectedBank, setSelectedBank] = useState("bca");

  const hargaTiket = ticketInfo?.harga || 1000000;
  //const feePlatform = Math.ceil(hargaTiket * 0.03);
  const rawFeePlatform = Math.ceil(hargaTiket * 0.03);
  const feePlatform = Math.max(rawFeePlatform, 27000);
  const isBelowMinimum = rawFeePlatform < 27000;

  const feeQris = metode === "QRIS_DINAMIS" ? Math.ceil(hargaTiket * 0.01) : 0;
  const feeMidtrans = metode === "MIDTRANS" ? 10000 : 0;
  const total = hargaTiket + feePlatform + feeQris + feeMidtrans + kodeUnik;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pembayaran/${pembayaranId}`);
        const data = await res.json();

        setTicketInfo({
          id: data.ticket?.id,
          namaKonser: data.ticket?.konser?.nama,
          tanggal: new Date(data.ticket?.konser?.tanggal).toLocaleDateString(
            "id-ID"
          ),
          jumlah: data.ticket?.jumlah,
          tempat: data.ticket?.tipeTempat,
          seat: data.ticket?.seat,
          harga: data.ticket?.harga_beli,
        });

        setMetode(data.metodePembayaran);
        setKodeUnik(data.kodeUnik);

        if (data.qrisExpiredAt) {
          const now = Date.now();
          const expired = new Date(data.qrisExpiredAt).getTime();
          const remaining = Math.floor((expired - now) / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      } catch (error) {
        console.error("Gagal mengambil data pembayaran", error);
      }
    };

    fetchData();
  }, [pembayaranId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && step < 4) {
      router.push("/");
    }
  }, [timeLeft, step]);

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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
    );
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const whatsappMessage = `Halo admin, aku mau konfirmasi pembayaran ya!\n\nID Tiket: ${
    ticketInfo?.id
  }\nKonser: ${ticketInfo?.namaKonser}\nTotal Bayar: ${formatRupiah(
    total
  )}\n\nNama rekening pengirim: (tulis nama rekeningmu di sini)\n\nBukti transfer: (upload screenshot ya!)`;

  const whatsappLink = `https://api.whatsapp.com/send/?phone=${ADMIN_PHONE}&text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {timeLeft > 0 ? (
        <div className="text-center text-sm text-red-500 font-semibold mb-2">
          ⏰ Selesaikan pembayaran dalam: {formatCountdown(timeLeft)}
        </div>
      ) : (
        <div className="text-center text-sm text-red-600 font-bold mb-2">
          ❌ Waktu pembayaran habis. Silakan kembali dan mulai ulang.
        </div>
      )}

      <Stepper step={step} />
      <Separator className="my-4" />

      {/* Step 1 */}
      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">1. Pilih Metode Pembayaran</h2>
          <div className="text-sm space-y-1">
            <div>🎤 {ticketInfo?.namaKonser}</div>
            <div>📅 {ticketInfo?.tanggal}</div>
            <div>
              🎫 {ticketInfo?.jumlah} Tiket - {ticketInfo?.tempat} (
              {ticketInfo?.seat})
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>💰 Harga Tiket:</span>
              <span>{formatRupiah(ticketInfo?.harga)}</span>
            </div>
            <div className="flex justify-between">
              <span>📦 Fee Platform:</span>
              <span>{formatRupiah(feePlatform)}</span>
            </div>
            {isBelowMinimum && (
              <div className="text-xs text-muted-foreground italic pl-4">
                batas minimal 27 ribu
              </div>
            )}

            {metode === "QRIS_DINAMIS" && (
              <>
                <div className="flex justify-between">
                  <span>➕ Fee QRIS:</span>
                  <span className="text-red-500">{formatRupiah(feeQris)}</span>
                </div>
                <div className="text-xs text-muted-foreground italic pl-4">
                  *tidak bisa di refund
                </div>
              </>
            )}
            {metode === "MIDTRANS" && (
              <>
                <div className="flex justify-between">
                  <span>➕ Fee Midtrans:</span>
                  <span className="text-red-500">
                    {formatRupiah(feeMidtrans)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground italic pl-4">
                  *tidak bisa di refund
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>🔢 Kode Unik:</span>
              <span>{kodeUnik}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>💳 Total Bayar:</span>
              <span>{formatRupiah(total)}</span>
            </div>
            <div className="flex justify-end">
              <div className="text-xs text-muted-foreground italic text-right">
                harga yang ditransfer
                <br />
                <span className="text-red-500 font-medium">wajib sama</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant={metode === "TRANSFER" ? "default" : "outline"}
              onClick={() => setMetode("TRANSFER")}
            >
              Transfer Bank (3%)
            </Button>
            <Button
              variant={metode === "QRIS_DINAMIS" ? "default" : "outline"}
              onClick={() => setMetode("QRIS_DINAMIS")}
            >
              QRIS (4%)
            </Button>
            <Button
              variant={metode === "MIDTRANS" ? "default" : "outline"}
              onClick={() => setMetode("MIDTRANS")}
            >
              Midtrans
            </Button>
          </div>
          <div className="flex justify-end pt-4">
  {metode === "MIDTRANS" ? (
    <Button
      onClick={async () => {
        const res = await fetch("/api/payment/midtrans/snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: ticketInfo.id }),
        });
        const data = await res.json();
        if (data.token) {
          setSnapToken(data.token);
          setStep(2);
        } else {
          alert("Gagal membuat Snap token");
        }
      }}
    >
      Bayar via Midtrans
    </Button>
  ) : (
    <Button onClick={() => setStep(2)}>Lanjut</Button>
  )}
</div>


        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && metode !== "MIDTRANS" && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">2. Pembayaran</h2>
          <div className="text-sm text-red-500 font-semibold">
            Waktu tersisa untuk bayar: {formatCountdown(timeLeft)}
          </div>
          {metode === "TRANSFER" ? (
            <>
              <div>Bank: {BANK.nama}</div>
              <div className="flex items-center justify-between gap-2">
                <span>Rekening: {BANK.rekening}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(BANK.rekening)}
                >
                  Copy
                </Button>
              </div>
              <div>Atas Nama: {BANK.atasNama}</div>
            </>
          ) : (
            <Image src={QRIS.image} alt="QRIS" width={250} height={250} />
          )}
          <Separator />
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>💰 Harga Tiket:</span>
              <span>{formatRupiah(ticketInfo?.harga)}</span>
            </div>
            <div className="flex justify-between">
              <span>📦 Fee Platform:</span>
              <span>{formatRupiah(feePlatform)}</span>
            </div>
            {metode === "QRIS_DINAMIS" && (
              <>
                <div className="flex justify-between">
                  <span>➕ Fee QRIS:</span>
                  <span className="text-red-500">{formatRupiah(feeQris)}</span>
                </div>
                <div className="text-xs text-muted-foreground italic pl-4">
                  *tidak bisa di refund
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>🔢 Kode Unik:</span>
              <span>{kodeUnik}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>💳 Total Bayar:</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-xs text-muted-foreground italic text-right">
              harga yang ditransfer
              <br />
              <span className="text-red-500 font-medium">wajib sama</span>
            </div>
          </div>
          <Separator />
          <div className="text-sm space-y-1">
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

{step === 2 && metode === "MIDTRANS" && (
  <Card className="p-6 space-y-4">
    <h2 className="text-xl font-bold">2. Pembayaran via Midtrans</h2>

    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span>💰 Harga Tiket:</span>
        <span>{formatRupiah(ticketInfo?.harga)}</span>
      </div>
      <div className="flex justify-between">
        <span>📦 Fee Platform:</span>
        <span>{formatRupiah(feePlatform)}</span>
      </div>
      <div className="flex justify-between">
        <span>💳 Fee Midtrans:</span>
        <span>{formatRupiah(feeMidtrans)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Total Bayar:</span>
        <span>{formatRupiah(total)}</span>
      </div>
    </div>

    <div id="midtrans-container" className="mt-6" />

    {snapToken && (
      <Script
        id="embed-snap"
        dangerouslySetInnerHTML={{
          __html: `
            window.snap.embed('${snapToken}', {
              embedId: 'midtrans-container',
              onSuccess: function(result){ console.log('✅ success', result); },
              onPending: function(result){ console.log('⏳ pending', result); },
              onError: function(result){ console.error('❌ error', result); },
              onClose: function(){ console.log('❎ popup closed'); }
            });
          `,
        }}
      />
    )}

    <div className="flex justify-start mt-4">
      <Button variant="outline" onClick={() => setStep(1)}>
        Kembali
      </Button>
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
