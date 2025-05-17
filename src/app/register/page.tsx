"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("62");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [phoneTaken, setPhoneTaken] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);


  const router = useRouter();

  const nameValid = name.trim().split(" ").length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = /^62\d{8,13}$/.test(phoneNumber);
  const usernameValid = /^[a-zA-Z]{3,12}$/.test(username);
  const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
  const confirmValid = password === confirmPassword;

  const isValid =
    nameValid &&
    emailValid &&
    phoneValid &&
    usernameValid &&
    passwordValid &&
    confirmValid &&
    !usernameTaken &&
    !emailTaken &&
    !phoneTaken &&
    acceptedTerms;

  const checkExists = async (type: "username" | "email" | "phone", value: string) => {
    if (!value) return;
    const res = await fetch(`/api/cek-user?${type}=${value}`);
    const data = await res.json();
    if (type === "username") setUsernameTaken(data.exists);
    if (type === "email") setEmailTaken(data.exists);
    if (type === "phone") setPhoneTaken(data.exists);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, phoneNumber, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("🎉 Akun berhasil dibuat! Langsung login yuk.");
      router.push("/login");
    } else {
      setError(data.message || "Registrasi gagal");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">🚀 Daftar Akun Baru</h1>
        <p className="text-sm text-muted-foreground text-center">
          Biar kamu bisa ikut lelang dan listing tiket juga 🎟️
        </p>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Nama lengkap minimal 2 kata"
              className={!nameValid && touched.name ? "border-red-500" : ""}
            />
            {!nameValid && touched.name && (
              <p className="text-xs text-red-500 mt-1">Nama minimal 2 kata</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, username: true }));
                checkExists("username", username);
              }}
              placeholder="3–12 huruf saja"
              className={!usernameValid || (touched.username && usernameTaken) ? "border-red-500" : ""}
            />
            {!usernameValid && touched.username && (
              <p className="text-xs text-red-500 mt-1">Username hanya boleh huruf dan 3–12 karakter</p>
            )}
            {usernameTaken && (
              <p className="text-xs text-red-500 mt-1">Username sudah terdaftar</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, phoneNumber: true }));
                checkExists("phone", phoneNumber);
              }}
              placeholder="Contoh: 6281234567890"
              className={!phoneValid || (touched.phoneNumber && phoneTaken) ? "border-red-500" : ""}
            />
            {!phoneValid && touched.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">Nomor harus dimulai dengan 62 dan minimal 10 digit</p>
            )}
            {phoneTaken && (
              <p className="text-xs text-red-500 mt-1">Nomor sudah digunakan</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, email: true }));
                checkExists("email", email);
              }}
              type="email"
              placeholder="Alamat email aktif"
              className={!emailValid || (touched.email && emailTaken) ? "border-red-500" : ""}
            />
            {!emailValid && touched.email && (
              <p className="text-xs text-red-500 mt-1">Format email tidak valid</p>
            )}
            {emailTaken && (
              <p className="text-xs text-red-500 mt-1">Email sudah digunakan</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Password kuat"
                className={!passwordValid && touched.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!passwordValid && touched.password && (
              <p className="text-xs text-red-500 mt-1">Minimal 6 karakter, kombinasi huruf besar, kecil, angka & simbol</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              placeholder="Ketik ulang password"
              className={!confirmValid && touched.confirmPassword ? "border-red-500" : ""}
            />
            {!confirmValid && touched.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
            )}
          </div>
          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              id="terms"
              className="mt-1"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              Saya telah membaca dan menyetujui{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                Syarat & Ketentuan Yuknawar
              </a>
            </label>
          </div>


          <Button type="submit" className="w-full mt-2" disabled={!isValid}>
            Daftar Sekarang
          </Button>
        </form>
      </Card>
    </div>
  );
}
