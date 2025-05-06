"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKirimKode = async () => {
    if (!phone.startsWith("62")) {
      toast.error("Nomor WA harus diawali 62 ya kak 😅");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-wa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) throw new Error("Gagal mengirim kode. Coba lagi ya 🥲");

      toast.success("Kode OTP udah dikirim ke WA kamu! 📩");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-wa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      if (!res.ok) throw new Error("Kode OTP salah atau udah expired 😭");

      toast.success("Login sukses! Selamat datang kembali 🎉");
      window.location.href = "/dashboard"; // sesuaikan
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex items-center">
      <Card className="w-full p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">👋 Masuk ke MOMEN</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Login cepet pake nomor WhatsApp kamu, tanpa ribet. 📱
        </p>
        <Separator className="mb-4" />

        {step === 1 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <Input
              placeholder="contoh: 6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handleKirimKode}
              disabled={loading || phone.length < 10}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Kirim Kode OTP 🔐"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              📩 Kode OTP udah dikirim ke WA kamu.
            </p>
            <label className="text-sm font-medium">Kode OTP</label>
            <Input
              placeholder="6 digit kode"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handleVerifikasi}
              disabled={loading || otp.length < 4}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verifikasi & Masuk 🚀"}
            </Button>
            <Button
              variant="ghost"
              className="text-xs w-full"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              🔁 Ganti Nomor
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
