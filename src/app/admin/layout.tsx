// app/admin/layout.tsx
import "@/app/globals.css";
import { Sidebar } from "@/app/components/admin/Sidebar";
import { Topbar } from "@/app/components/admin/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-900 border-r border-gray-800">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800">
          <Topbar />
        </header>
        <main className="flex-1 p-6 bg-gray-900 text-white">{children}</main>
      </div>
    </div>
  );
}
