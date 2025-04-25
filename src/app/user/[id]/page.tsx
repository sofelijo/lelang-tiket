import { prisma } from "@/lib/prisma";

type Props = {
  params: { id: string };
};

export default async function UserDetailPage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(params.id), // ✅ ID di dalam `where`
    },
  });

  if (!user) return <div>User tidak ditemukan.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Detail User</h1>
      <p>Nama: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

