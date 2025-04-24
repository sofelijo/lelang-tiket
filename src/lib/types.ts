




import { User as PrismaUser, Comment } from '@prisma/client'



export interface User {
    id: string;
    name: string;
    email: string;
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
  
  export interface Ticket {
    id: number;
    seat: string;
    tipeTempat: string;
    harga_awal: number;
    batas_waktu: string;
    harga_beli: number | null;
    kelipatan: number | null;
    perpanjangan_bid: string | null;
    deskripsi: string;
    konser: Konser;
    kategori: Kategori;
    bids: Bid[];
  }
  
  export type CommentWithUser = Comment & {
  user: User | null;
};

