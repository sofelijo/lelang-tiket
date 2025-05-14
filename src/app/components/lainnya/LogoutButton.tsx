'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button'; // jika pakai shadcn

export default function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-red-500 hover:text-red-600 text-sm"
    >
      🚪 Logout
    </Button>
  );
}
