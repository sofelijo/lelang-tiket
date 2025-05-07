import Link from "next/link";

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 hidden md:block">
      <div className="p-6 font-bold text-xl text-white border-b border-gray-800">
        Admin Panel
      </div>
      <nav className="flex flex-col gap-2 px-6 py-4 text-white">
        <Link
          href="/admin"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/tiket"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Kelola Tiket
        </Link>
        <Link
          href="/admin/konser"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Kelola Konser
        </Link>
        <Link
          href="/admin/user"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Kelola User
        </Link>
        <Link href="/admin/kategori" className="hover:text-blue-600">Kelola Kategori</Link>
        <Link href="/admin/tiket-lelang" className="hover:text-blue-600">Tiket Lelang</Link>
        <Link href="/admin/tiket-jual" className="hover:text-blue-600">Tiket Jual</Link>
      </nav>
    </div>
  );
}
