// app/verifikasi-wa/otp/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VerifikasiOtpPage() {
  const params = useSearchParams();
  const router = useRouter();

  const phone = params?.get("phone") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!phone) {
      toast.error("Nomor WhatsApp tidak ditemukan.");
      router.push("/verifikasi-wa");
    }
  }, [phone, router]);

  const handleVerifikasi = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Kode OTP harus diisi");
      return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/auth/otp/verify", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, code: otp }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Verifikasi berhasil!");
        router.push("/"); // Arahkan ke beranda
      } else {
        toast.error(data.message || "Verifikasi gagal");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat verifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("🔁 OTP baru dikirim ke WhatsApp kamu");
      } else {
        toast.error(data.message || "Gagal mengirim ulang OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim ulang OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg bg-background shadow">
      <h1 className="text-2xl font-bold mb-4 text-black">Masukkan OTP</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Kami udah kirim kode OTP ke <b className="text-black">{phone}</b> lewat WhatsApp.
      </p>

      <Input
        type="text"
        placeholder="Contoh: 1234"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        className="text-black"
      />

      <Button
        onClick={handleVerifikasi}
        disabled={loading || otp.length < 4}
        className="mt-4 w-full"
      >
        {loading ? "Memverifikasi..." : "Verifikasi"}
      </Button>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Belum dapat OTP?{" "}
        <Button
          variant="link"
          onClick={handleResend}
          disabled={resending}
          className="p-0 h-auto text-primary"
        >
          {resending ? "Mengirim ulang..." : "Kirim ulang"}
        </Button>
      </div>
    </div>
  );
}
