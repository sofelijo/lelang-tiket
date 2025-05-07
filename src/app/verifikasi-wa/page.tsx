"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VerifikasiWA() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState(session?.user?.phoneNumber || "");
  const [loading, setLoading] = useState(false);

  // 🔐 Redirect jika user sudah terverifikasi
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isVerified) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleSendOTP = async () => {
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      toast.error("📵 Nomor WA tidak valid. Gunakan format 62xxx...");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ OTP dikirim ke WhatsApp kamu");
        router.push(`/verifikasi-wa/otp?phone=${phone}`);
      } else {
        toast.error(data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-6 text-center">⏳ Memuat data kamu...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-2xl bg-background shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-black">Verifikasi WhatsApp</h1>
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        Masukkan nomor WhatsApp kamu biar bisa dapetin OTP.
        <br />
        Ini penting buat verifikasi akun kamu 🔐
      </p>
      <Input
        type="tel"
        placeholder="Contoh: 6281234567890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={loading}
        className="text-black"
      />
      <Button
        onClick={handleSendOTP}
        disabled={loading || !phone}
        className="mt-4 w-full"
      >
        {loading ? "Mengirim OTP..." : "Kirim OTP via WhatsApp"}
      </Button>
    </div>
  );
}
