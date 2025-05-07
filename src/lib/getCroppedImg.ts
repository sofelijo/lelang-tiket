// src/lib/getCroppedImg.ts
export const getCroppedImg = async (
    imageSrc: string,
    crop: { x: number; y: number },
    zoom: number,
    aspect: number,
    croppedAreaPixels: any
  ): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
  
    if (!ctx) throw new Error("Failed to get canvas context");
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
  
    return canvas.toDataURL("image/jpeg");
  };
  