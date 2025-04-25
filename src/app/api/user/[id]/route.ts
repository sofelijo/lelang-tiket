// src/app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET detail user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = Number(params.id);

  if (!session || Number(session.user.id) !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
      role: true,
      username: true,
      bio: true,
      image: true,
      provinsiId: true,
      kotaId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT update user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = Number(params.id);

  const isAdmin = session?.user.role === 'ADMIN';
  const isOwner = Number(session?.user.id) === userId;

  if (!session || (!isOwner && !isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const data = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        username: data.username,
        bio: data.bio,
        image: data.image,
        provinsiId: data.provinsiId,
        kotaId: data.kotaId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
