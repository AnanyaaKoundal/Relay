const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
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

/* ─── Types ─── */

export type PresignResponse = {
  uploadUrl: string;
  fileKey: string;
};

export type CompleteResponse = {
  message: string;
};

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

export function uploadFileWithProgress(
  proxyBaseUrl: string,
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
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
}
