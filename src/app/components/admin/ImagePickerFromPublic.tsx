"use client";

import { useEffect, useState } from "react";

type Props = {
  selected: string;
  onSelect: (filename: string) => void;
};

export default function ImagePickerFromPublic({ selected, onSelect }: Props) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Ganti dengan manual list, atau fetch dari server kalau dynamic
    setImages([
      "yoasobi.jpg",
      "taylor.jpg",
      "blackpink.jpg",
    ]);
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">🎨 Pilih Gambar Konser (folder /public/konser)</p>
      <div className="grid grid-cols-2 gap-2">
        {images.map((filename) => (
          <div
            key={filename}
            onClick={() => onSelect(filename)}
            className={`cursor-pointer border rounded overflow-hidden ${
              `/konser/${filename}` === selected
                ? "border-blue-500"
                : "border-gray-300"
            }`}
          >
            <img
              src={`/konser/${filename}`}
              alt={filename}
              className="w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
