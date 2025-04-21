// src/app/api/bid/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, amount } = body;

    const bid = await prisma.bid.create({
      data: {
        ticketId: ticketId,
        amount: amount,
      },
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error('❌ Error saat menambahkan bid:', error);
    return NextResponse.json({ message: 'Gagal menambahkan bid' }, { status: 500 });
  }
}
