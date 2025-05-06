import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { addHours, differenceInHours } from 'date-fns';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, amount } = body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    const now = new Date();

    if (ticket.batas_waktu && ticket.batas_waktu < now) {
      return NextResponse.json({ message: 'Lelang sudah ditutup' }, { status: 400 });
    }

    const latestBid = ticket.bids[0];
    const kelipatan = ticket.kelipatan || 0;
    const harga_awal = ticket.harga_awal || 0;
    const minBid = latestBid ? latestBid.amount + kelipatan : harga_awal;

    if (amount < minBid) {
      return NextResponse.json({ message: `Penawaran harus minimal ${minBid}` }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        ticketId: Number(ticketId),
        userId: Number(session.user.id),
        amount: Number(amount),
      },
    });

    // ✅ Perpanjangan logika berdasarkan waktu SISA (difference dari sekarang)
    const targetDurasiJam =
      ticket.perpanjangan_bid === "SATU_HARI" ? 24 :
      ticket.perpanjangan_bid === "DUA_HARI" ? 48 :
      null;

    if (ticket.batas_waktu && targetDurasiJam) {
      const sisaJam = differenceInHours(ticket.batas_waktu, now);
      if (sisaJam < targetDurasiJam) {
        const newDeadline = addHours(now, targetDurasiJam);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { batas_waktu: newDeadline },
        });
        console.log(`⏱️ Batas waktu diperpanjang ke: ${newDeadline.toISOString()} (karena sisa hanya ${sisaJam} jam)`);
      }
    }

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('🔥 Error saat menambahkan bid:', error);
    return NextResponse.json({ message: 'Gagal tambah bid', error }, { status: 500 });
  }
}
