'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  email: string;
};

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log('Decoded token:', decoded);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error('Token invalid', error);
        setUserEmail(null);
      }
    }
  }, []);

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">LelangTiket</div>
      <div className="flex gap-4 items-center">
        <a href="/auction">Lelang</a>
        <a href="/market">Jual Beli</a>
        {userEmail ? (
          <>
            <span>👋 {userEmail}</span>
            <button
              onClick={() => {
                Cookies.remove('token');
                window.location.href = '/';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <a href="/login">Login</a>
        )}
      </div>
    </nav>
  );
}
