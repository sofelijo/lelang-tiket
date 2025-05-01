import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <a href="/" className="text-xl font-bold hover:underline">
        LelangTiket
      </a>
      <div className="flex gap-4 items-center">
        <a href="/auction" className="hover:underline">Lelang</a>
        <a href="/market" className="hover:underline">Jual Beli</a>
        {session?.user ? (
          <>
            <a href="/profile" className="hover:underline">
              👤 {session.user.name || 'Profil'}
            </a>
            <LogoutButton />
          </>
        ) : (
          <a href="/login" className="hover:underline">Login</a>
        )}
      </div>
    </nav>
  );
}
