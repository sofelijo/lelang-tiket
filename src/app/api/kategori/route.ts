import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const konserId = searchParams.get('konserId');

  if (!konserId) {
    return NextResponse.json({ message: 'konserId dibutuhkan' }, { status: 400 });
  }

  try {
    const data = await prisma.kategori.findMany({
      where: {
        konserKategori: {
          some: {
            konserId: parseInt(konserId),
          },
        },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error ambil kategori berdasarkan konserId:', error);
    return NextResponse.json({ message: 'Gagal ambil data kategori' }, { status: 500 });
  }
}
