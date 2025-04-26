'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push('/'); // arahkan ke halaman utama
    } else {
      alert('Email atau password salah');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
        >
          Login
        </button>
      </form>

      {/* Tambahkan ini untuk tombol Daftar */}
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
