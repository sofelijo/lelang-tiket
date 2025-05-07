// app/admin/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Total User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">124</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Total Tiket</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">53</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Pembayaran Sukses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">Rp 12.500.000</p>
        </CardContent>
      </Card>
    </div>
  );
}
