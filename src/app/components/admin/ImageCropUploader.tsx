// src/app/components/admin/ImageCropUploader.tsx

"use client";

import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import { getCroppedImg } from "@/lib/cropImage"; // ✅ helper crop
import { Slider } from "@/components/ui/slider"; // pakai slider shadcn atau ganti input range

type Props = {
  konserId: number;
  onSuccess: (filename: string) => void;
};

export default function ImageCropUploader({ konserId, onSuccess }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels || !file) return;

    setLoading(true);
    const croppedBlob = await getCroppedImg(image, croppedAreaPixels);

    const formData = new FormData();
    formData.append("file", croppedBlob, "cropped.jpg");
    formData.append("konserId", konserId.toString());

    const res = await fetch("/api/upload-konser-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess(data.filename); // `/konser/konserid{id}.jpg`
    } else {
      alert("Upload gagal");
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">📷 Upload Gambar Konser</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {image && (
        <>
          <div className="relative w-full h-[300px] bg-black">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={3 / 2} // ✅ rasio 3:2 sesuai permintaan
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="pt-2">
            <label className="text-xs text-muted-foreground">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Mengupload..." : "Upload"}
          </button>
        </>
      )}
    </div>
  );
}
