"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react"; // ikon loading

type Props = {
  isVerified: boolean;
};

export type SidebarItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: "verified" | "unverified";
};

/**
 * Fungsi reusable untuk Navbar maupun Sidebar
 */
export function ProfileSidebarItems(user: { isVerified?: boolean }) {
  return [
    { label: "Profil Saya", href: "/profile", icon: "👤" },
    { label: "Riwayat Pesanan", href: "/profile/pesanan", icon: "📄" },
    { label: "Ganti Password", href: "/profile/password", icon: "🔒" },
    { label: "Listing Tiketmu", href: "/profile/listinguser", icon: "🎫" },
    {
      label: "Verifikasi Nomor",
      href: "/profile/verifikasi-wa",
      icon: user?.isVerified ? "✅" : "❌",
    },
  ];
}

/**
 * Komponen Sidebar utama
 */
const ProfileSidebar = ({ isVerified }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sidebarItems: SidebarItem[] = [
    { label: "👀 Detail Akun", href: "/profile" },
    { label: "🧾 Riwayat Pesanan", href: "/profile/pesanan" },
    { label: "🔒 Ganti Password", href: "/profile/password" },
    { label: "🎟️ Listing Tiketmu", href: "/profile/listinguser" },
    {
      label: "📱 Verifikasi Nomor",
      href: "/profile/verifikasi-wa",
      badge: isVerified ? "verified" : "unverified",
    },
  ];

  const handleClick = (href: string) => {
    setLoadingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <aside className="w-full md:w-64 p-4 space-y-2 bg-white rounded-xl shadow border border-border">
      <nav className="flex flex-col space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const isBadgeItem = item.badge !== undefined;
          const isLoading = isPending && loadingHref === item.href;

          return (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between transition-all hover:bg-muted w-full text-left",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <span>{item.label}</span>
              <span className="ml-2 flex items-center">
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
                ) : isBadgeItem ? (
                  item.badge === "verified" ? (
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )
                ) : null}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};


export { ProfileSidebar };
