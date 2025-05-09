"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProfileSidebar } from "@/app/components/profile/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "⏳ Menunggu Pembayaran", value: "PENDING" },
  { label: "🚚 Diproses", value: "DIPROSES" },
  { label: "✅ Selesai", value: "BERHASIL" },
  { label: "❌ Dibatalkan", value: "GAGAL" },
];

export default function PesananPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("PENDING");
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.isVerified) {
      setIsVerified(true);
    }

    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}/orders?status=${tab}`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        });
    }
  }, [session, tab]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <ProfileSidebar isVerified={isVerified} />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">🧾 Riwayat Pemesanan</h1>

        {/* Tabs */}
        <div className="w-full flex justify-between mb-4 border rounded-md overflow-hidden">
  {TABS.map((item) => (
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
          <p className="text-muted-foreground">⏳ Lagi ngambil data pesanan...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">Kamu belum punya pesanan di tab ini 🤷‍♀️</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{order.ticket.konser.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      🎫 {order.ticket.kategori.nama} • {order.ticket.seat || "bebas"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      Rp {order.jumlahTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {order.metodePembayaran === "LELANG"
                    ? "Dibeli lewat sistem lelang"
                    : "Pembelian langsung"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
