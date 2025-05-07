'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginWaPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleKirimOtp = async () => {
    if (!phone.startsWith("62")) {
      toast.error("Nomor WA harus diawali dengan 62 ya kak 😅");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-wa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) throw new Error("Gagal kirim kode. Coba lagi ya 🥲");

      toast.success("Kode OTP udah dikirim ke WhatsApp kamu 📲");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const res = await signIn("wa-otp", {
      redirect: false,
      phone,
      code: otp,
    });

    if (res?.ok) {
      toast.success("Berhasil login! Selamat datang kembali 🎉");
      router.push("/");
    } else {
      toast.error("OTP salah atau udah expired 😭");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center px-4">
      <Card className="w-full p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">🚀 Masuk via WhatsApp</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Gak usah ribet. Cukup masukin nomor WA dan kita kirim OTP-nya!
        </p>
        <Separator className="mb-4" />

        {step === 1 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <Input
              placeholder="Contoh: 6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handleKirimOtp}
              disabled={loading || phone.length < 10}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Kirim Kode OTP 🔐"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              🔒 Kode OTP udah dikirim ke WhatsApp kamu.
            </p>
            <label className="text-sm font-medium">Masukkan Kode OTP</label>
            <Input
              placeholder="6 digit"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loading || otp.length < 4}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang 🚀"}
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

        <div className="text-sm text-center text-muted-foreground mt-6">
          Punya akun email?{" "}
          <Button variant="link" size="sm" onClick={() => router.push("/login")}>
            Login pakai email
          </Button>
        </div>
      </Card>
    </div>
  );
}
