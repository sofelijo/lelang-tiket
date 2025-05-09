"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";

export default function GantiPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (session?.user?.isVerified) setIsVerified(true);

    const fetchUser = async () => {
      if (session?.user?.id) {
        const res = await fetch(`/api/user/${session.user.id}`);
        const data = await res.json();
        setPhone(data.phoneNumber || "");
      }
    };

    fetchUser();
  }, [session]);

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error("⚠️ Nomor WhatsApp tidak tersedia di akun kamu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (res.ok) {
        toast.success("✅ OTP berhasil dikirim ke WhatsApp kamu");
        setOtpSent(true);
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      toast.error("❌ Terjadi kesalahan saat kirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!otp || !newPassword) {
      toast.error("⚠️ Isi semua kolom terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          otp,
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success("✅ Password berhasil diganti!");
        router.push("/profile");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal mengganti password");
      }
    } catch (err) {
      toast.error("❌ Error saat mengganti password");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-4">⏳ Loading dulu yaa...</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <ProfileSidebar isVerified={isVerified} />

      <div className="flex-1">
        <Card className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">🔐 Ganti Password</h1>

          <div className="space-y-2">
            <Label>Nomor WhatsApp</Label>
            <Input
              value={phone}
              readOnly
              className="cursor-not-allowed bg-gray-100 text-black"
            />
            {!phone && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ Nomor WhatsApp belum tersedia di akun kamu.
              </p>
            )}
          </div>

          {!otpSent && (
            <Button
              onClick={handleSendOtp}
              disabled={loading || !phone}
              className="w-full"
            >
              {loading ? "Mengirim OTP..." : "Kirim OTP ke WhatsApp"}
            </Button>
          )}

          {otpSent && (
            <>
              <div className="space-y-2">
                <Label>Kode OTP</Label>
                <Input
                  type="text"
                  placeholder="Masukkan kode OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Mengganti..." : "Ganti Password"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
