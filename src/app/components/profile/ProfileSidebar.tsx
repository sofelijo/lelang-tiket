"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="w-full md:w-64 p-4 space-y-2 bg-white rounded-xl shadow border border-border">
      <nav className="flex flex-col space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const isBadgeItem = item.badge !== undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between transition-all hover:bg-muted",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <span>{item.label}</span>
              {isBadgeItem &&
                (item.badge === "verified" ? (
                  <BadgeCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                ))}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export { ProfileSidebar };
