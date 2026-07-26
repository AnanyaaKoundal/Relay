import type { AuthResponse, LoginInput, RegisterInput, User, UpgradeToInstructorPayload } from "@/types/auth.types";
import { API_URL } from "@/lib/config";

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

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

export async function logoutUser(): Promise<void> {
  await request<{ message: string }>("/auth/logout", { method: "POST" });
}

export async function onboardInstructor(payload: UpgradeToInstructorPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/instructor/onboard", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
