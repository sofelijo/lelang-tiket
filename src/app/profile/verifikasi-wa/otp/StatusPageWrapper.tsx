"use client";

import dynamic from "next/dynamic";

// dynamic() TANPA ssr: false, karena sudah di client component
const SnapStatusPage = dynamic(() => import("./OtpClient"));

export default function StatusPageWrapper() {
  return <SnapStatusPage />;
}
