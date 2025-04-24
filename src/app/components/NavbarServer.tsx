// app/components/NavbarServer.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from './LogoutButton'; // kita buat di step 2

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">LelangTiket</div>
      <div className="flex gap-4 items-center">
        <a href="/auction">Lelang</a>
        <a href="/market">Jual Beli</a>
        {session?.user ? (
          <>
            <span>👋 {session.user.email}</span>
            <LogoutButton /> {/* tombol logout client-side */}
          </>
        ) : (
          <a href="/login">Login</a>
        )}
      </div>
    </nav>
  );
}
