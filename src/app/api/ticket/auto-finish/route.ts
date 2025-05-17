import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function PATCH() {
  try {
    const now = new Date();
    console.log("📌 Menjalankan auto-finish pada:", now.toISOString());

    const expiredTickets = await prisma.ticket.findMany({
      where: {
        statusLelang: { in: ["BERLANGSUNG", "PENDING", "BOOKED"] },
        batas_waktu: { lt: now },
        kelipatan: { not: null },
      },
      include: {
        bids: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { user: true },
        },
        konser: true,
        kategori: true,
        user: true, // penjual
      },
    });

    console.log("🎯 Jumlah tiket expired ditemukan:", expiredTickets.length);

    let count = 0;

    for (const ticket of expiredTickets) {
      const lastBid = ticket.bids[0];

      console.log(`🔄 Updating ticket ID ${ticket.id} | Last bid user: ${lastBid?.userId ?? "(no bid)"}`);

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          statusLelang: "SELESAI",
          pemenangId: lastBid?.userId ?? null,
        },
      });

      // Kirim WhatsApp ke pemenang dan penjual jika ada bid
      if (lastBid && lastBid.user?.phoneNumber?.startsWith("62")) {
        const konser = ticket.konser;
        const tanggalKonser = new Date(konser.tanggal).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const msgPemenang = `🎉 Congrats, ${lastBid.user.name}!

Kamu berhasil memenangkan lelang tiket konser di *Yuknawar*!
Berikut detail konser yang kamu menangkan:

🎤 *${konser.nama}*
🗓️ ${tanggalKonser}
📍 ${konser.lokasi}${konser.venue ? " – " + konser.venue : ""}

🎟️ Tiket kamu:
– Kategori: ${ticket.kategori.nama}
– Jumlah: ${ticket.jumlah} tiket
– Tempat: ${ticket.tipeTempat}

✨ Yuk amankan tiketmu sekarang!
Kamu punya waktu *1x24 jam* buat menyelesaikan pembayaran:
👉 yuknawar.com/bayar/${ticket.id}

Thanks udah ikutan lelang seru di Yuknawar 🔥`;

        const msgPenjual = `✨ Yey, ${ticket.user?.name}! Lelangmu laku keras!

Tiket yang kamu listing di *Yuknawar* udah resmi dimenangkan oleh:
🏆 ${lastBid.user.name}

Berikut detail konser & tiket yang dimenangkan:

🎤 *${konser.nama}*
🗓️ ${tanggalKonser}
📍 ${konser.lokasi}${konser.venue ? " – " + konser.venue : ""}

🎟️ Detail Tiket:
– Kategori: ${ticket.kategori.nama}
– Jumlah: ${ticket.jumlah} tiket
– Tempat: ${ticket.tipeTempat}

🕒 Kalau pemenang udah bayar, kamu bakal dapet WA buat koordinasi langsung.
Thanks udah pake Yuknawar! 🚀`;

        try {
          const waPayload = {
            data: [
              {
                phone: lastBid.user.phoneNumber,
                message: msgPemenang,
              },
              ticket.user?.phoneNumber
                ? {
                    phone: ticket.user.phoneNumber,
                    message: msgPenjual,
                  }
                : null,
            ].filter(Boolean),
          };

          const waRes = await axios.post(
            "https://bdg.wablas.com/api/v2/send-message",
            waPayload,
            {
              headers: {
                Authorization: process.env.WABLAS_TOKEN!,
                "Content-Type": "application/json",
              },
            }
          );

          if (!waRes.data.status) {
            console.warn("⚠️ Gagal kirim WA:", waRes.data);
          } else {
            console.log("✅ WA berhasil dikirim ke pemenang & penjual");
          }
        } catch (waError) {
          console.error("❌ Error kirim WA:", waError);
        }
      }

      count++;
    }

    console.log("✅ Auto-finish selesai. Total tiket diupdate:", count);

    return NextResponse.json({
      message: "Auto finish success",
      totalUpdated: count,
    });
  } catch (error) {
    console.error("❌ Error auto-finish:", error);
    return NextResponse.json({ error: "Gagal auto-finish" }, { status: 500 });
  }
}

export async function GET() {
  console.log("🌐 GET /api/ticket/auto-finish dipanggil, redirecting ke PATCH");
  return PATCH();
}
