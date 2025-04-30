// 📁 /app/api/payment/midtrans/va/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ticketId, bank } = await req.json();

  if (!ticketId || !bank) {
    return NextResponse.json({ error: 'ticketId and bank are required' }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      konser: true,
      user: true,
    },
  });

  if (!ticket || !ticket.konser || !ticket.user) {
    return NextResponse.json({ error: 'Invalid ticket or missing data' }, { status: 404 });
  }

  const timestamp = Date.now();
  const orderId = `lelang-${ticket.konser.id}-${timestamp}`;
  const grossAmount = (ticket.harga_beli || 0) + 27000; // Harga + fee minimum

  const midtransPayload = {
    payment_type: 'bank_transfer',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    bank_transfer: {
      bank,
    },
    customer_details: {
      first_name: ticket.user.name || 'Pengguna',
      email: ticket.user.email || 'noemail@example.com',
      phone: ticket.user.phoneNumber || '081234567890',
    },
    item_details: [
      {
        id: `ticket-${ticket.id}`,
        name: `Tiket ${ticket.konser.nama}`,
        price: ticket.harga_beli,
        quantity: 1,
      },
      {
        id: 'fee-platform',
        name: 'Fee Platform',
        price: 27000,
        quantity: 1,
      },
    ],
    expiry: {
      start_time: new Date().toISOString().slice(0, 19).replace('T', ' ') + ' +0700',
      unit: 'minute',
      duration: 30,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL}/pembayaran/sukses`,
    },
  };

  try {
    const response = await axios.post('https://api.sandbox.midtrans.com/v2/charge', midtransPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Midtrans error:', error.response?.data || error);
    return NextResponse.json({ error: 'Failed to create VA payment' }, { status: 500 });
  }
}
