"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { Input } from "@/components/ui/input";
import { Search, X, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileSidebarItems } from "@/app/components/profile/ProfileSidebar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Notifikasi = {
  id: string;
  pesan: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

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
  const router = useRouter();
  const [openNotif, setOpenNotif] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<Notifikasi[]>([]);

  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const refreshNotif = async () => {
    try {
      const res = await fetch("/api/notifikasi");
      const data = await res.json();
      setNotif(data);
    } catch (error) {
      console.error("Gagal fetch notifikasi:", error);
    }
  };

  useEffect(() => {
    if (!session?.user) return;

    const fetchNotif = async () => {
      try {
        const res = await fetch("/api/notifikasi");
        const data = await res.json();
        setNotif(data);
      } catch (err) {
        console.error("❌ Gagal fetch notifikasi:", err);
      }
    };

    fetchNotif();
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    setSearch("");
    setResult([]);
  }, [pathname]);

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
          <Link href="/" className="text-white text-xl">
            <span className="font-bold">YUK</span>NAWAR
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
          <button
            onClick={() =>
              startTransition(() => {
                router.push("/tambah-tiket");
              })
            }
            disabled={isPending}
            className="hover:text-blue-400 transition text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Listing Tiket</>
            )}
          </button>

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
                            setOpenNotif(false);
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
                  {ProfileSidebarItems(session.user).map((item) => {
                    const isLoading = isPending && loadingHref === item.href;

                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          setLoadingHref(item.href);
                          startTransition(() => {
                            router.push(item.href);
                            document.body.click(); // tetap tutup popover
                          });
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md transition flex items-center justify-between",
                          "hover:bg-muted"
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {item.icon} {item.label}
                        </span>
                        {isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                  <hr className="my-1 border-muted" />
                  <LogoutButton />
                </PopoverContent>
              </Popover>
            </>
          )}

          {!session?.user && status !== "loading" && (
            <Link href="/login" className="hover:text-blue-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
