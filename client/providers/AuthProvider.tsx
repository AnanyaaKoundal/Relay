"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, UpgradeToInstructorPayload, AuthContextType } from "@/types/auth.types";
import { loginUser, registerUser, getCurrentUser, logoutUser, onboardInstructor } from "@/services/auth.service";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    const res = await loginUser(data);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; password: string }) => {
    const res = await registerUser(data);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // clear locally even if server call fails
    }
    setUser(null);
  }, []);

  const upgradeToInstructor = useCallback(async (data: UpgradeToInstructorPayload) => {
    const res = await onboardInstructor(data);
    setUser(res.user);
    return res.user;
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        upgradeToInstructor,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        isInstructor: user?.isInstructor ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
