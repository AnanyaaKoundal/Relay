import { API_URL } from "@/lib/config";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }

  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new Error("Received an invalid response from the server.");
  }

  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Something went wrong");
  }

  return data as T;
}

import type { PresignResponse, CompleteResponse } from "@/types/upload.types";

/* ─── API ─── */

export async function presignUpload(
  fileName: string,
  fileType: string,
  lessonId: string,
): Promise<PresignResponse> {
  return request<PresignResponse>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ fileName, fileType, lessonId }),
  });
}

export async function completeUpload(
  lessonId: string,
  fileKey: string,
): Promise<CompleteResponse> {
  return request<CompleteResponse>("/uploads/complete", {
    method: "POST",
    body: JSON.stringify({ lessonId, fileKey }),
  });
}

/* ─── XHR Upload with Progress (via backend proxy to avoid CORS) ─── */

export async function uploadFileWithProgress(
  proxyBaseUrl: string,
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  let lastError;
  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    try {
      return new Promise((resolve, reject) => {
        const proxyUrl = `${proxyBaseUrl}/uploads/proxy?url=${encodeURIComponent(uploadUrl)}`;
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", proxyUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed — network error"));
        xhr.send(file);
      });
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await delay(Math.pow(2, i) * 1000);
      }
    }
  }
  throw lastError;
}
