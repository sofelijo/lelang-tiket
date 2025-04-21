// src/app/api/konser/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const konser = await prisma.konser.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(konser);
  } catch (error) {
    console.error('Gagal mengambil konser:', error);
    return NextResponse.json({ message: 'Gagal mengambil konser' }, { status: 500 });
  }
}
