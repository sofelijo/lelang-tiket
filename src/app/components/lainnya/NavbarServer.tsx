"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { Input } from "@/components/ui/input";
import { Search, X, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(!pathname?.startsWith("/admin"));
  }, [pathname]);

  if (!shouldShow) return null;
  return <NavbarClient />;
}

function NavbarClient() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const notifMock = [
    {
      id: "1",
      pesan: "🎉 Kamu menang lelang tiket BLACKPINK!",
      waktu: "2 menit lalu",
      isRead: false,
    },
    {
      id: "2",
      pesan: "Tawaranmu disalip di tiket Dewa 19",
      waktu: "1 jam lalu",
      isRead: true,
    },
  ];

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (Object.keys(data).length > 0) setSession(data);
    }
    fetchSession();
  }, []);
  useEffect(() => {
    setSearch("");
    setResult([]);
  }, [pathname]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (search.length >= 3) {
        setLoading(true);
        const res = await fetch(`/api/search?query=${search}`);
        const data = await res.json();
        setResult(data || []);
        setLoading(false);
      } else {
        setResult([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="text-xl font-bold text-white">
            lelang<span className="text-blue-400">tiket</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-[400px]">
          <div className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full shadow-sm bg-white/10">
            <Search className="w-4 h-4 text-white/80" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari konser, artis, atau kota"
              className="bg-transparent border-none focus-visible:ring-0 text-sm text-white placeholder:text-white/60"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>

          {search.length > 0 && search.length < 3 && (
            <Card className="absolute w-full mt-2 z-50 p-4 rounded-xl bg-white/90 text-sm text-blue-900">
              Ketik minimal 3 huruf dulu ya 😎
            </Card>
          )}

          {search.length >= 3 && (
            <Card className="absolute w-full mt-2 z-50 p-4 rounded-xl bg-white">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
              {!loading && result.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Gak nemu hasilnya, coba lagi ya 🙏
                </p>
              )}
              {!loading && result.length > 0 && (
                <ul className="space-y-3">
                  {result.map((item) => (
                    <Link
                      href={`/konser/${item.id}`}
                      key={item.id}
                      className="flex items-start gap-3 hover:bg-gray-100 p-2 rounded-lg transition"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-center pt-3 text-gray-500">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{item.nama}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.lokasi} • {item.venue}
                        </div>
                      </div>
                    </Link>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        {/* Menu */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/auction" className="hover:text-blue-400 transition">
            Lelang
          </Link>
          <Link href="/market" className="hover:text-blue-400 transition">
            Jual Beli
          </Link>

          {session?.user && (
            <>
              {/* Notifikasi Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-1">
                    <Bell className="w-5 h-5" />
                    {notifMock.some((n) => !n.isRead) && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">Notifikasi</h4>
                  {notifMock.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Belum ada notifikasi
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifMock.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-md border hover:bg-muted cursor-pointer"
                        >
                          <p className="text-sm">{n.pesan}</p>
                          <span className="text-xs text-gray-500">{n.waktu}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Nama User */}
              <Link href="/profile" className="hover:text-blue-400">
                👤 {session.user.name || "Profil"}
              </Link>
              <LogoutButton />
            </>
          )}

          {!session?.user && (
            <Link href="/login" className="hover:text-blue-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
