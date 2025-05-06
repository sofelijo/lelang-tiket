import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phoneNumber?: string; // ✅ Tambahan untuk WhatsApp login
    };
  }

  interface User {
    id: string;
    role?: string;
    phoneNumber?: string; // ✅ Tambahan agar bisa diakses dari JWT
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    phoneNumber?: string; // ✅ Tambahan supaya token bisa bawa nomor WA
  }
}
