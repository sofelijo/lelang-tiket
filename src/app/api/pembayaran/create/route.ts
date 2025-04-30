// /app/api/pembayaran/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId, metodePembayaran } = await req.json();
  const buyerId = Number(session.user.id);

  // Cek apakah sudah ada pembayaran aktif
  const existing = await prisma.pembayaran.findFirst({
    where: {
      ticketId,
      buyerId,
      statusPembayaran: "PENDING",
      qrisExpiredAt: {
        gt: new Date(), // belum expired
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id }); // pakai transaksi lama
  }

  // Ambil info tiket
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { konser: true, user: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
  }

  const kodeUnik = Math.floor(100 + Math.random() * 900);
  const harga = ticket.harga_beli ?? 0;
  const feePlatform = Math.ceil(harga * (metodePembayaran === "QRIS_DINAMIS" ? 0.04 : 0.03));
  const jumlahTotal = harga + feePlatform + kodeUnik;
  const qrisExpiredAt =
    metodePembayaran === "QRIS_DINAMIS"
      ? new Date(Date.now() + 30 * 60 * 1000)
      : null;

  // Buat data pembayaran baru
  const pembayaran = await prisma.pembayaran.create({
    data: {
      ticketId,
      buyerId,
      metodePembayaran,
      jumlahTotal,
      kodeUnik,
      feePlatform,
      statusPembayaran: "PENDING",
      qrisExpiredAt,
    },
  });

  return NextResponse.json({ id: pembayaran.id });
}
