// lib/auth.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth"; // <-- Tambah ini

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
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
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          phoneNumber: user.phoneNumber,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        if (!token.sub) throw new Error('Token tidak memiliki sub');
        session.user.id = token.sub ?? '';
        session.user.role = (typeof token.role === 'string') ? token.role : '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
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

// 🆕 Tambahin ini
/** Ambil data user yang sedang login di server (API Routes) */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session.user;
}
