"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";

export default function VerifikasiWA() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState(session?.user?.phoneNumber || "");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setIsVerified(!!session?.user?.isVerified);

      if (session?.user?.isVerified) {
        router.push("/profile");
      }
    }
  }, [status, session, router]);

  const handleSendOTP = async () => {
    if (!phone || !/^62\d{9,13}$/.test(phone)) {
      toast.error("📵 Nomor WA tidak valid. Gunakan format 62xxxxxxxxxx");
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
        toast.success("✅ OTP berhasil dikirim ke WhatsApp kamu!");
        router.push(`/verifikasi-wa/otp?phone=${phone}`);
      } else {
        toast.error(data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Terjadi kesalahan saat mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-6 text-center">⏳ Memuat data kamu...</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <ProfileSidebar isVerified={isVerified} />

      <div className="flex-1">
        <div className="bg-white shadow-xl rounded-2xl border border-border p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            📱 Verifikasi WhatsApp
          </h1>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Masukkan nomor WhatsApp kamu buat dapetin OTP.
            <br />
            Ini penting biar akunmu aman dan bisa transaksi 🔐
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
      </div>
    </div>
  );
}
