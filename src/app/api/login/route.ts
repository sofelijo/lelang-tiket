// app/api/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  // Cari user di database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // Buat JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Serialize token sebagai cookie httpOnly
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Kirim cookie di response
  const response = NextResponse.json({ message: 'Login successful' });
  response.headers.set('Set-Cookie', cookie);

  return response;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  console.log('Token:', token);

  return NextResponse.json({ token });
}
