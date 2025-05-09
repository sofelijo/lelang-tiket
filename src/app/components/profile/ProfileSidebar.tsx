"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isVerified: boolean; // status verifikasi nomor HP
};

const sidebarItems = [
  { label: "👤 Detail Akun", href: "/profile" },
  { label: "🧾 Riwayat Pesanan", href: "/profile/pesanan" },
  { label: "🔒 Ganti Password", href: "/profile/password" },
  { label: "🎟️ Listing Tiketmu", href: "/profile/listinguser" },
];

export function ProfileSidebar({ isVerified }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 p-4 space-y-2 bg-white rounded-xl shadow border border-border">
      <nav className="flex flex-col space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-muted",
              pathname === item.href
                ? "bg-muted text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}

        {/* Verifikasi Nomor HP */}
        <Link
          href="/profile/verifikasinomor"
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-between hover:bg-muted transition-all",
            pathname === "/profile/verifikasinomor"
              ? "bg-muted text-primary"
              : "text-muted-foreground"
          )}
        >
          <span>📱 Verifikasi Nomor</span>
          {isVerified ? (
            <BadgeCheck className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </Link>
      </nav>
    </aside>
  );
}
