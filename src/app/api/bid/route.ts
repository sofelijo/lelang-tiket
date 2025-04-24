// app/api/bid/route.ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

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
          take: 1
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    const now = new Date();
    if (ticket.batas_waktu < now) {
      return NextResponse.json({ message: 'Lelang sudah ditutup' }, { status: 400 });
    }

    const latestBid = ticket.bids[0];
    const minBid = latestBid ? latestBid.amount + (ticket.kelipatan || 0) : ticket.harga_awal;

    if (amount < minBid) {
      return NextResponse.json({
        message: `Penawaran harus minimal ${minBid}`
      }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        ticketId: Number(ticketId),
        userId: Number(session.user.id),
        amount: Number(amount),
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('Error saat menambahkan bid:', error);
    return NextResponse.json({ message: 'Gagal tambah bid', error }, { status: 500 });
  }
}
