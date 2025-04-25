import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kotaId = searchParams.get('kotaId');

  if (!kotaId || kotaId.length !== 4) {
    return NextResponse.json({ error: 'ID kota tidak valid' }, { status: 400 });
  }

  const data = await prisma.$queryRaw`
    SELECT id, nama FROM wilayah
    WHERE LENGTH(id) = 6 AND id LIKE ${kotaId + '%'}
    ORDER BY nama
  `;
  return NextResponse.json(data);
}
