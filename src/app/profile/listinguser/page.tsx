"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { label: "🚀 Berlangsung", value: "BERLANGSUNG" },
  { label: "✅ Selesai", value: "SELESAI" },
  { label: "📌 Booked", value: "BOOKED" },
  { label: "📦 Pending", value: "PENDING" },
];

export default function ListingUserPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("BERLANGSUNG");
  const [isVerified, setIsVerified] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="default">{ticket.statusLelang}</Badge>
                  <Badge variant="secondary">🎟️ {ticket.jumlah} Tiket</Badge>
                  <Badge variant="secondary">
                    {ticket.sebelahan ? "🪑 Duduk Sebelahan" : "🚶‍♂️ Bebas"}
                  </Badge>
                  <Badge variant="outline">
                    {ticket.kelipatan ? "Lelang" : "Jual Langsung"}
                  </Badge>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  {ticket.statusLelang === "BERLANGSUNG" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/ticket/${ticket.id}/edit`)}
                    >
                      ✏️ Edit
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/ticket/${ticket.id}`)}
                  >
                    👁️ Lihat
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
