import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, metodePembayaran } = await req.json();
    const buyerId = Number(session.user.id);

    const existing = await prisma.pembayaran.findFirst({
      where: {
        ticketId,
        buyerId,
        statusPembayaran: "PENDING",
        qrisExpiredAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existing) {
      return NextResponse.json({ id: existing.id });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { konser: true, user: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    const kodeUnik = Math.floor(100 + Math.random() * 900);
    const harga = ticket.harga_beli ?? 0;
    const rawPlatform = Math.ceil(harga * 0.03);
    const feePlatform = Math.max(rawPlatform, 27000);
    const jumlahTotal = harga + feePlatform + kodeUnik;
    const order_id = `lelang-${ticket.konser.id}-${Date.now()}`;

    const pembayaran = await prisma.pembayaran.create({
      data: {
        ticketId,
        buyerId,
        jumlahTotal,
        kodeUnik,
        feePlatform,
        order_id,
        snapMethod: (metodePembayaran || "bank_transfer").toLowerCase(),
        statusPembayaran: "PENDING",
        qrisExpiredAt: null,
      },
    });

    return NextResponse.json({ id: pembayaran.id });
  } catch (err) {
    console.error("❌ Error di pembayaran/create:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
