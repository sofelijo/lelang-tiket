// types/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phoneNumber?: string;
      isVerified?: boolean; // ✅ Tambahan untuk verifikasi nomor WA
    };
  }

  interface User {
    id: string;
    role?: string;
    phoneNumber?: string;
    isVerified?: boolean; // ✅ Agar tersedia saat signIn
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    phoneNumber?: string;
    isVerified?: boolean; // ✅ Tambahan supaya bisa dibawa di token
  }
}
