import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const itemIdParam = req.nextUrl.searchParams.get('itemId');
  const itemType = req.nextUrl.searchParams.get('itemType'); // 'ticket' atau 'konser'

  const itemId = itemIdParam ? parseInt(itemIdParam) : null;

  if (!itemId || !itemType) {
    return NextResponse.json({ message: 'itemId dan itemType diperlukan' }, { status: 400 });
  }

  try {
    let comments = [];

    if (itemType === 'ticket') {
      comments = await prisma.comment.findMany({
        where: { ticketId: itemId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (itemType === 'konser') {
      comments = await prisma.comment.findMany({
        where: { konserId: itemId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ message: 'itemType tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Gagal ambil komentar:', error);
    return NextResponse.json({ message: 'Gagal ambil komentar' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, itemType, content } = await req.json();
  const userId = Number(session.user.id);

  if (!itemId || !itemType || !content) {
    return NextResponse.json({ message: 'itemId, itemType, dan content wajib diisi' }, { status: 400 });
  }

  try {
    let comment;

    if (itemType === 'ticket') {
      comment = await prisma.comment.create({
        data: {
          ticketId: Number(itemId),
          userId,
          content,
        },
        include: { user: { select: { name: true } } },
      });
    } else if (itemType === 'konser') {
      comment = await prisma.comment.create({
        data: {
          konserId: Number(itemId),
          userId,
          content,
        },
        include: { user: { select: { name: true } } },
      });
    } else {
      return NextResponse.json({ message: 'itemType tidak valid' }, { status: 400 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Gagal tambah komentar:', error);
    return NextResponse.json({ message: 'Gagal tambah komentar' }, { status: 500 });
  }
}
