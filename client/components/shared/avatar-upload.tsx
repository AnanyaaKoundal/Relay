"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { presignAvatar, saveAvatar, uploadFileWithProgress } from "@/services/upload.service";
import { API_URL } from "@/lib/config";
import { resolveAvatarUrl } from "@/lib/utils";
import { Loader2, Upload, X, Trash2 } from "lucide-react";

type AvatarUploadProps = {
  userId: string;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
};

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
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

const AVATAR_SIZES = [128, 256, 512];

export function AvatarUpload({ userId, currentUrl, onUploadComplete, onRemove }: AvatarUploadProps) {
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
      const croppedBlob = await getCroppedImg(imgSrc, croppedAreaPixels);
      const presignedUrls = await presignAvatar();

      for (let i = 0; i < presignedUrls.length; i++) {
        const { size, uploadUrl } = presignedUrls[i];
        const resizedBlob = await resizeImage(croppedBlob, size, size);
        const file = new File([resizedBlob], `avatar-${size}.webp`, { type: "image/webp" });

        await uploadFileWithProgress(API_URL, uploadUrl, file, () => {}, "/auth/proxy");
        setProgress(Math.round(((i + 1) / presignedUrls.length) * 100));
      }

      const mainAvatarUrl = `avatars/${userId}/avatar?v=${Date.now()}`;
      await saveAvatar(mainAvatarUrl);

      onUploadComplete(mainAvatarUrl);
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
          <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden bg-muted">
            <Cropper
              image={imgSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex items-center gap-4 max-w-xs mx-auto">
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

          <div className="flex items-center gap-2 justify-center">
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
                  Upload Avatar
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
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 rounded-full overflow-hidden bg-muted">
            {currentUrl ? (
              <img
                src={resolveAvatarUrl(currentUrl) ?? undefined}
                alt="Avatar"
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                ?
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Upload className="size-4" />
              {currentUrl ? "Change Avatar" : "Upload Avatar"}
            </button>
            {currentUrl && onRemove && (
              <button
                onClick={onRemove}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
