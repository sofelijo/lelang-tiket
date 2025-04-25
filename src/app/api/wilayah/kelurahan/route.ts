import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kecamatanId = searchParams.get('kecamatanId');

  if (!kecamatanId || kecamatanId.length !== 8) {
    return NextResponse.json({ error: 'ID kecamatan tidak valid' }, { status: 400 });
  }

  const data = await prisma.$queryRaw`
    SELECT kode, nama FROM wilayah
    WHERE LENGTH(kode) = 13 AND kode LIKE ${kecamatanId + '%'}
    ORDER BY nama
  `;
  return NextResponse.json(data);
}
