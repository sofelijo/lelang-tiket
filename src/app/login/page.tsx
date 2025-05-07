'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'wa'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle login email-password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/');
    } else {
      alert('Email atau password salah');
    }
  };

  // Kirim OTP via API
  const handleKirimOtp = async () => {
    if (!phone.startsWith('62')) {
      alert('Nomor harus dimulai dengan 62');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error();

      setOtpSent(true);
      alert('Kode OTP telah dikirim!');
    } catch {
      alert('Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle login pakai OTP
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('wa-otp', {
      redirect: false,
      phone,
      code: otp,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/');
    } else {
      alert('OTP salah atau sudah kedaluwarsa');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Login ke MOMEN</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('email')}
          className={`w-full py-2 rounded ${mode === 'email' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
        >
          Login Email
        </button>
        <button
          onClick={() => setMode('wa')}
          className={`w-full py-2 rounded ${mode === 'wa' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
        >
          Login WhatsApp
        </button>
      </div>

      {mode === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Nomor WhatsApp (62...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          {!otpSent && (
            <button
              type="button"
              onClick={handleKirimOtp}
              className="w-full p-2 rounded bg-green-600 hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim OTP'}
            </button>
          )}

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Masukkan OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Login...' : 'Login'}
              </button>
            </>
          )}
        </form>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400 mb-2">Belum punya akun?</p>
        <button
          onClick={() => router.push('/register')}
          className="text-blue-400 hover:text-blue-500 font-semibold"
        >
          Daftar
        </button>
      </div>
    </div>
  );
}
