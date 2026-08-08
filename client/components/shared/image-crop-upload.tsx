"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { presignBanner, saveBanner, uploadFileWithProgress } from "@/services/upload.service";
import { API_URL } from "@/lib/config";
import { Loader2, Upload, X } from "lucide-react";
import { resolveBannerUrl } from "@/lib/utils";

type ImageCropUploadProps = {
  courseId: string;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
};

async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.85);
  });
}

async function resizeImage(blob: Blob, width: number, height: number): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      URL.revokeObjectURL(url);
      resolve(b!);
    }, "image/webp", 0.85);
  });
}

const BANNER_SIZES = [
  { width: 400, height: 225 },
  { width: 800, height: 450 },
  { width: 1280, height: 720 },
];

export function ImageCropUpload({ courseId, currentUrl, onUploadComplete }: ImageCropUploadProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: unknown, areaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imgSrc || !croppedAreaPixels) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get cropped image
      const croppedBlob = await getCroppedImg(imgSrc, croppedAreaPixels);

      // 2. Get presigned URLs
      const presignedUrls = await presignBanner(courseId);

      // 3. Resize and upload each size
      for (let i = 0; i < presignedUrls.length; i++) {
        const { size, uploadUrl, fileKey } = presignedUrls[i];
        const { width, height } = BANNER_SIZES[i];

        const resizedBlob = await resizeImage(croppedBlob, width, height);
        const file = new File([resizedBlob], `banner-${size}.webp`, { type: "image/webp" });

        await uploadFileWithProgress(
          API_URL,
          uploadUrl,
          file,
          () => {},
        );

        setProgress(Math.round(((i + 1) / presignedUrls.length) * 100));
      }

      // 4. Save banner URL (use 800px version as main)
      const mainBannerUrl = `course-banner/${courseId}/banner?v=${Date.now()}`;
      await saveBanner(courseId, mainBannerUrl);

      onUploadComplete(mainBannerUrl);
      setImgSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setImgSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {imgSrc ? (
        <div className="space-y-4">
          {/* Crop preview */}
          <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
            <Cropper
              image={imgSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-4">
            <label className="text-xs text-muted-foreground">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading... {progress}%
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload Banner
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <X className="size-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current banner preview */}
          {currentUrl && (
            <div className="relative">
              <img
                src={resolveBannerUrl(currentUrl) ?? undefined}
                alt="Current banner"
                className="w-full aspect-video object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="size-5" />
            {currentUrl ? "Change Banner" : "Upload Banner"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}