"use client";

import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { Input } from "@/components/ui/input";
import { Search, X, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileSidebarItems } from "@/app/components/profile/ProfileSidebar";
import Link from "next/link";

// Ganti jadi:
import { useRouter, usePathname } from "next/navigation";

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
type Notifikasi = {
  id: string;
  pesan: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

function NavbarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [openNotif, setOpenNotif] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<Notifikasi[]>([]);

  const refreshNotif = async () => {
    try {
      const res = await fetch("/api/notifikasi");
      const data = await res.json();
      setNotif(data);
    } catch (error) {
      console.error("Gagal fetch notifikasi:", error);
    }
  };

  // ✅ Ambil session user
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          console.log("👤 Session berhasil:", data);
          setSession(data);
        }
      } catch (error) {
        console.error("❌ Gagal ambil session:", error);
      }
    }

    fetchSession();
  }, []);

  // ✅ Fetch notifikasi saat session siap
  useEffect(() => {
    if (!session?.user) return;

    const fetchNotif = async () => {
      try {
        const res = await fetch("/api/notifikasi");
        const data = await res.json();
        console.log("📨 Notifikasi masuk ke state:", data); // DEBUG LOG
        setNotif(data);
      } catch (err) {
        console.error("❌ Gagal fetch notifikasi:", err);
      }
    };

    fetchNotif();
    const interval = setInterval(fetchNotif, 30000); // polling tiap 30 detik
    return () => clearInterval(interval);
  }, [session]);

  // ✅ Reset hasil pencarian saat berpindah halaman
  useEffect(() => {
    setSearch("");
    setResult([]);
  }, [pathname]);

  // ✅ Pencarian konser (search bar)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (search.length >= 3) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?query=${search}`);
          const data = await res.json();
          setResult(data || []);
        } catch (error) {
          console.error("❌ Gagal fetch search:", error);
        }
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
            MOMEN
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
          <Link href="/tambah-tiket" className="hover:text-blue-400 transition">
            Listing Tiket
          </Link>

          {session?.user && (
            <>
              {/* 🔔 Notifikasi */}
              <Popover open={openNotif} onOpenChange={setOpenNotif}>
                <PopoverTrigger asChild>
                  <button className="relative p-1">
                    <Bell className="w-5 h-5" />
                    {notif.some((n) => !n.isRead) && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifikasi</h4>
                    {notif.length > 0 && (
                      <button
                        onClick={async () => {
                          await fetch("/api/notifikasi/mark-all", {
                            method: "PATCH",
                          });
                          refreshNotif();
                        }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {notif.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Belum ada notifikasi
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notif.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setOpenNotif(false); // ⬅️ manual close
                            router.push(n.link);
                          }}
                          className="text-left w-full p-2 rounded-md border hover:bg-muted transition"
                        >
                          <p className="text-sm">{n.pesan}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(n.createdAt).toLocaleString("id-ID")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* 👤 Nama User */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="hover:text-blue-400">
                    👤 {session.user.name?.split(" ")[0] || "Profil"}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-56 p-2 space-y-1" align="end">
                  {ProfileSidebarItems(session.user).map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        document.body.click(); // buat nutupin popover manual
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <hr className="my-1 border-muted" />
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/signout", { method: "POST" });
                      router.push("/login");
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 transition"
                  >
                    🚪 Logout
                  </button>
                </PopoverContent>
              </Popover>
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
