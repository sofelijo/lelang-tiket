import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kecamatanId = searchParams.get('kecamatanId');

  if (!kecamatanId || kecamatanId.length !== 6) {
    return NextResponse.json({ error: 'ID kecamatan tidak valid' }, { status: 400 });
  }

  const data = await prisma.$queryRaw`
    SELECT id, nama FROM wilayah
    WHERE LENGTH(id) = 10 AND id LIKE ${kecamatanId + '%'}
    ORDER BY nama
  `;
  return NextResponse.json(data);
}
