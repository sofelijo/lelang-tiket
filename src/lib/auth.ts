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
      id: "credentials", // default
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
      
        const passwordMatch = await bcrypt.compare(credentials.password, user.password || '');
        if (!passwordMatch) return null;
      
        // 🔧 Ubah semua null → undefined agar cocok dengan type NextAuth.User
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
          phoneNumber: user.phoneNumber ?? undefined, // ✅ FIX
        };
      }
      
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        if (!token.sub) throw new Error('Token tidak memiliki sub');
        session.user.id = token.sub ?? '';
        session.user.role = typeof token.role === 'string' ? token.role : '';
        session.user.phoneNumber = token.phoneNumber ?? '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phoneNumber = (user as any).phoneNumber;
      }
      return token;
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
