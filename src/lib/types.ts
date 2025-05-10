import { User as PrismaUser, Comment } from '@prisma/client';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string; // ✅ ditambahkan
  image?: string;    // ✅ bisa dipakai di banyak tempat
}

export interface Bid {
  id: number;
  amount: number;
  createdAt: string;
  user: User | null;
}

export interface Konser {
  id: number;
  nama: string;
  tempat: string;
  tanggal: string;
}

export interface Kategori {
  id: number;
  nama: string;
}

export type Ticket = {
  id: string;
  seat: string | null;
  tipeTempat: string;
  harga_awal: number;
  harga_beli?: number | null;
  batas_waktu: string;
  deskripsi?: string;
  statusLelang: "PENDING" | "BERLANGSUNG" | "SELESAI";
  jumlah: number;
  konser: {
    nama: string;
    lokasi: string;
    tanggal: string;
  };
  kategori: {
    nama: string;
  };
  bids: {
    amount: number;
    createdAt: string;
    user?: {
      name?: string;
      username?: string;
    } | null;
  }[];
  user: User; // ✅ tambahkan ini jika kamu butuh info penjual
};

export type CommentWithUser = Comment & {
  user: User | null;
};

export type Pembayaran = {
  id: string;
  metodePembayaran: "TRANSFER" | "QRIS_DINAMIS" | "MIDTRANS";
  kodeUnik: number;
  qrisExpiredAt?: string;
  ticket: {
    id: number;
    konser: {
      nama: string;
      tanggal: string;
    };
    jumlah: number;
    tipeTempat: string;
    seat: string;
    harga_beli: number;
  };
};
