import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinsiId = searchParams.get('provinsiId');

  if (!provinsiId || provinsiId.length !== 2) {
    return NextResponse.json({ error: 'ID provinsi tidak valid' }, { status: 400 });
  }

  const kota = await prisma.$queryRaw`
    SELECT kode, nama FROM wilayah
    WHERE LENGTH(kode) = 5 AND kode LIKE ${provinsiId + '%'}
    ORDER BY nama
  `;

  return NextResponse.json(kota);
}
