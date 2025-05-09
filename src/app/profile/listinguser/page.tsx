"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { label: "📦 Pending", value: "PENDING" },
  { label: "🚀 Berlangsung", value: "BERLANGSUNG" },
  { label: "✅ Selesai", value: "SELESAI" },
  { label: "📌 Booked", value: "BOOKED" },
];

export default function ListingUserPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("PENDING");
  const [isVerified, setIsVerified] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.isVerified) {
      setIsVerified(true);
    }

    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}/tickets?status=${tab}`)
        .then((res) => res.json())
        .then((data) => {
          setTickets(data);
          setLoading(false);
        });
    }
  }, [session, tab]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <ProfileSidebar isVerified={isVerified} />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">🎟️ Listing Tiketmu</h1>

        {/* Tabs */}
        <div className="w-full flex justify-between mb-4 border rounded-md overflow-hidden">
          {STATUS_TABS.map((item) => (
            <Button
              key={item.value}
              variant={tab === item.value ? "default" : "outline"}
              onClick={() => {
                setTab(item.value);
                setLoading(true);
              }}
              className={cn(
                "flex-1 rounded-none text-sm font-medium transition-all",
                tab === item.value ? "" : "text-black bg-white"
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="mb-4" />

        {loading ? (
          <p className="text-muted-foreground">⏳ Lagi nyari listing tiket kamu...</p>
        ) : tickets.length === 0 ? (
          <p className="text-muted-foreground">Belum ada tiket dengan status ini 😅</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{ticket.konser?.nama || "Tanpa Judul Konser"}</p>
                    <p className="text-sm text-muted-foreground">
                      🎫 {ticket.kategori?.nama || "Tanpa Kategori"} • {ticket.seat || "bebas"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {ticket.harga_beli
                        ? `Rp ${ticket.harga_beli.toLocaleString()}`
                        : "Tanpa harga beli langsung"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {ticket.statusLelang === "BERLANGSUNG"
                    ? "Lelang sedang berlangsung"
                    : ticket.statusLelang === "BOOKED"
                    ? "Tiket sudah dibooking, menunggu pembayaran"
                    : ticket.statusLelang === "SELESAI"
                    ? "Tiket sudah laku"
                    : "Menunggu mulai lelang"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
