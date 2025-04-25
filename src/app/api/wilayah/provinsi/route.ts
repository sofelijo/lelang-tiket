import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const provinsi = await prisma.$queryRaw`
    SELECT kode, nama FROM wilayah WHERE LENGTH(kode) = 2 ORDER BY nama
  `;
  return NextResponse.json(provinsi);
}
