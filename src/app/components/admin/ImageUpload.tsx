// src/app/components/admin/ImageUpload.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CroppedArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function ImageUpload({
  onChange,
  initialImage,
}: {
  onChange: (base64: string | null) => void;
  initialImage?: string | null;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(initialImage || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  useEffect(() => {
    if (initialImage) {
      setCroppedImage(initialImage);
      setImage(null); // pastikan cropper tidak muncul langsung
    }
  }, [initialImage]);

  const onCropComplete = useCallback(
    (_: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCroppedImage(null);
      onChange(null);
    }
  };

  const handleCropAndPreview = async () => {
    if (!image || !croppedAreaPixels) return;

    const imageObj = await createImage(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx?.drawImage(
      imageObj,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setCroppedImage(base64);
          onChange(base64);
        };
        reader.readAsDataURL(blob);
      }
    }, "image/jpeg");
  };

  const resetImage = () => {
    setImage(null);
    setCroppedImage(null);
    onChange(null);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4 text-white">
      <Label className="block">Upload Gambar Konser</Label>
      <Input type="file" accept="image/*" onChange={handleImageChange} />

      {image && !croppedImage && (
        <div>
          <div className="relative w-full h-[300px] bg-black">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={3 / 2}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <Button
            type="button"
            className="mt-2 bg-green-600 hover:bg-green-700"
            onClick={handleCropAndPreview}
          >
            Crop & Preview
          </Button>
        </div>
      )}

      {croppedImage && (
        <div>
          <img src={croppedImage} alt="Preview" className="w-64 h-auto rounded-md mt-2" />
        </div>
      )}

      {(image || croppedImage) && (
        <Button
          type="button"
          variant="destructive"
          onClick={resetImage}
          className="mt-2"
        >
          Reset Gambar
        </Button>
      )}
    </div>
  );
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}
