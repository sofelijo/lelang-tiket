// src/lib/auth.ts

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 🔐 Login Email & Password
    CredentialsProvider({
      id: "credentials",
      name: 'Login Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !credentials.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password || '', user.password || '');
        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          role: user.role,
          isVerified: user.isVerified,
          phoneNumber: user.phoneNumber ?? undefined,
        };
      }
    }),

    // 📲 Login via WhatsApp OTP
    CredentialsProvider({
      id: "wa-otp",
      name: 'Login WhatsApp',
      credentials: {
        phone: { label: 'Nomor WhatsApp', type: 'text' },
        code: { label: 'Kode OTP', type: 'text' },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.phone || !credentials.code) return null;

        const otp = await prisma.otpLogin.findFirst({
          where: {
            phone: credentials.phone,
            code: credentials.code,
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        });

        if (!otp) return null;

        await prisma.otpLogin.update({
          where: { id: otp.id },
          data: { isUsed: true },
        });

        let user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phoneNumber: credentials.phone,
              username: `user${Date.now()}`,
              name: "Pengguna Baru",
              isVerified: true,
              role: "USER",
            },
          });
        }

        return {
          id: String(user.id),
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          role: user.role,
          isVerified: user.isVerified,
          phoneNumber: user.phoneNumber ?? undefined,
        };
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.isVerified = user.isVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 🆕 Ambil session server-side
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session.user;
}
