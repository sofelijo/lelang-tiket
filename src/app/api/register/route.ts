// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, username, phoneNumber, email, password } = await req.json();

    // Validasi semua field harus ada
    if (!name || !username || !phoneNumber || !email || !password) {
      return NextResponse.json(
        { message: 'Semua field (name, username, phoneNumber, email, password) wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Cek apakah username sudah digunakan
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pilih default avatar acak dari 1 sampai 10
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    const randomAvatar = `/images/default-avatar${randomIndex}.png`;

    // Simpan user
    await prisma.user.create({
      data: {
        name,
        username,
        phoneNumber,
        email,
        password: hashedPassword,
        isVerified: false,
        role: 'USER',
        image: randomAvatar, // Set avatar default
      },
    });

    return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 201 });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat registrasi' }, { status: 500 });
  }
}
