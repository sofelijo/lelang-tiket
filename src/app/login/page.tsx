"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"email" | "wa">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("62");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (lastSent) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSent) / 1000);
        const remaining = 60 - elapsed;
        if (remaining > 0) {
          setSecondsLeft(remaining);
        } else {
          setSecondsLeft(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastSent]);

  const handleLoginEmail = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      toast.success("Berhasil login! Selamat datang kembali 🎉");
      router.push("/");
    } else {
      toast.error("Email atau password salah 😭");
    }
    setLoading(false);
  };

  const handleKirimOtp = async () => {
    if (!phone.startsWith("62")) {
      toast.error("Nomor WA harus diawali dengan 62 ya kak 😅");
      return;
    }

    if (lastSent && Date.now() - lastSent < 60 * 1000) {
      toast.error(
        "Kode sudah dikirim. Tunggu 1 menit ya sebelum kirim ulang ⏳"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-wa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.status === 429) {
        toast.error("Tunggu sebentar sebelum kirim ulang OTP ya kak 🕐");
        return;
      }

      if (!res.ok) throw new Error("Gagal kirim kode. Coba lagi ya 🥲");

      toast.success("Kode OTP udah dikirim ke WhatsApp kamu 📲");
      setStep(2);
      setLastSent(Date.now());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtp = async () => {
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
        <h1 className="text-2xl font-bold mb-2">
          {mode === "email" ? "📧 Login Pakai Email" : "🚀 Masuk via WhatsApp"}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {mode === "email"
            ? "Masuk pakai akun email kamu yang udah terdaftar."
            : "Gak usah ribet. Cukup masukin nomor WA dan kita kirim OTP-nya!"}
        </p>
        <Separator className="mb-4" />

        {mode === "email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginEmail();
            }}
            className="space-y-3"
          >
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="email@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <label className="text-sm font-medium">Password</label>
            <Input
              placeholder="Password kamu..."
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Login Sekarang 🚀"
              )}
            </Button>
          </form>
        )}

        {mode === "wa" && (
          <div className="space-y-3">
            {step === 1 && (
              <>
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
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Kirim Kode OTP 🔐"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Kamu cuma bisa minta OTP 1x setiap 1 menit
                </p>
              </>
            )}

            {step === 2 && (
              <>
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
                  onClick={handleLoginOtp}
                  disabled={loading || otp.length < 4}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Masuk Sekarang 🚀"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-xs mt-2"
                  onClick={handleKirimOtp}
                  disabled={loading || secondsLeft > 0}
                >
                  {secondsLeft > 0
                    ? `⏳ Kirim ulang OTP dalam ${secondsLeft}s`
                    : "🔁 Kirim Ulang OTP"}
                </Button>

                <Button
                  variant="ghost"
                  className="text-xs w-full"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  🔁 Ganti Nomor
                </Button>
              </>
            )}
          </div>
        )}

        <div className="text-sm text-center text-muted-foreground mt-6">
          {mode === "email" ? (
            <>
              Pengen login cepat pake WA?{" "}
              <Button variant="link" size="sm" onClick={() => setMode("wa")}>
                Login via WhatsApp
              </Button>
            </>
          ) : (
            <>
              Punya akun email?{" "}
              <Button variant="link" size="sm" onClick={() => setMode("email")}>
                Login pakai email
              </Button>
            </>
          )}
          <br></br>
           <span className="text-muted-foreground">Belum punya akun? </span>
          <Button
            variant="link"
            size="sm"
           
            onClick={() => router.push("/register")} // atau sesuaikan dengan route kamu
          >
            Daftar dulu yuk ✨
          </Button>
        </div>
       
      </Card>
    </div>
  );
}
