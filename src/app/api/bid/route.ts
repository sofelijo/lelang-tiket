import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { addHours, differenceInHours } from 'date-fns';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id; // ✅ Fix untuk semua userId yang butuh number
    const body = await req.json();
    const { ticketId, amount } = body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: true, // ✅ tambahkan ini!
          },
        },
        konser: true,
      }
      
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Tiket tidak ditemukan' }, { status: 404 });
    }

    const now = new Date();

    if (ticket.batas_waktu && ticket.batas_waktu < now) {
      return NextResponse.json({ message: 'Lelang sudah ditutup' }, { status: 400 });
    }

    const latestBid = ticket.bids[0];
    const kelipatan = ticket.kelipatan || 0;
    const harga_awal = ticket.harga_awal || 0;
    const minBid = latestBid ? latestBid.amount + kelipatan : harga_awal;

    if (amount < minBid) {
      return NextResponse.json({ message: `Penawaran harus minimal ${minBid}` }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        ticketId: Number(ticketId),
        userId: userId,
        amount: Number(amount),
      },
    });

    // ✅ Notifikasi ke pemilik tiket
    if (ticket.userId && ticket.userId !== userId) {
      await prisma.notifikasi.create({
        data: {
          userId: ticket.userId,
          pesan: `🔥 Ada tawaran baru di tiket konser ${ticket.konser.nama}`,
          link: `/ticket/${ticket.id}`,
        },
      });
    }

    // ✅ Notifikasi ke pemasang bid
    await prisma.notifikasi.create({
      data: {
        userId: userId,
        pesan: `✅ Penawaran kamu di konser ${ticket.konser.nama} berhasil dikirim!`,
        link: `/ticket/${ticket.id}`,
      },
    });

    // ✅ Notifikasi ke semua penawar sebelumnya (kecuali diri sendiri)
    const semuaBidder = await prisma.bid.findMany({
      where: {
        ticketId: Number(ticketId),
        userId: { not: userId },
      },
      distinct: ['userId'],
    });

    const promises = semuaBidder.map((bidder) =>
      prisma.notifikasi.create({
        data: {
          userId: bidder.userId,
          pesan: `⚠️ Tawaranmu di konser ${ticket.konser.nama} disalip orang lain!`,
          link: `/ticket/${ticket.id}`,
        },
      })
    );
    await Promise.all(promises);

    // ✅ Perpanjangan waktu
    const targetDurasiJam =
      ticket.perpanjangan_bid === "SATU_HARI" ? 24 :
      ticket.perpanjangan_bid === "DUA_HARI" ? 48 :
      null;

    if (ticket.batas_waktu && targetDurasiJam) {
      const sisaJam = differenceInHours(ticket.batas_waktu, now);
      if (sisaJam < targetDurasiJam) {
        const newDeadline = addHours(now, targetDurasiJam);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { batas_waktu: newDeadline },
        });
        console.log(`⏱️ Batas waktu diperpanjang ke: ${newDeadline.toISOString()} (karena sisa hanya ${sisaJam} jam)`);
      }
    }

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('🔥 Error saat menambahkan bid:', error);
    return NextResponse.json({ message: 'Gagal tambah bid', error }, { status: 500 });
  }
}
