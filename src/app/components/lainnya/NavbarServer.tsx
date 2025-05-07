"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from './LogoutButton';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [pathname]);

  if (!shouldShow) return null;

  return <NavbarClient />;
}

function NavbarClient() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (Object.keys(data).length > 0) setSession(data);
    }
    fetchSession();
  }, []);

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <a href="/" className="text-xl font-bold hover:underline">
        LelangTiket
      </a>
      <div className="flex gap-4 items-center">
        <a href="/auction" className="hover:underline">Lelang</a>
        <a href="/market" className="hover:underline">Jual Beli</a>
        {session?.user ? (
          <>
            <a href="/profile" className="hover:underline">
              👤 {session.user.name || 'Profil'}
            </a>
            <LogoutButton />
          </>
        ) : (
          <a href="/login" className="hover:underline">Login</a>
        )}
      </div>
    </nav>
  );
}
