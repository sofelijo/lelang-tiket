"use client";

import { useState } from "react";

type Props = {
  konserId: number;
  onSuccess: (filename: string) => void;
};

export default function ImageUploader({ konserId, onSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("konserId", konserId.toString());

    setLoading(true);
    const res = await fetch("/api/upload-konser-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess(data.filename); // contoh: "/konser/konserid12.jpg"
    } else {
      alert("Upload gagal");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">🖼️ Upload Gambar Konser</p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button
        type="button"
        onClick={handleUpload}
        className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        disabled={!selectedFile || loading}
      >
        {loading ? "Mengupload..." : "Upload"}
      </button>
    </div>
  );
}
