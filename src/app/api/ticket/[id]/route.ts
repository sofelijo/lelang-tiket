// src/app/api/ticket/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      konser: true,
      kategori: true,
      bids: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
    
  });

  if (!ticket) {
    return NextResponse.json({ message: 'Tiket tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
