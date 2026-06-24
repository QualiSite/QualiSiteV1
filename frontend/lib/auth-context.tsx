"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

// ── Types ─────────────────────────────────────────

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Contexte ──────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au montage : tente de récupérer un nouveau token via le cookie refresh
  const tryRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include", // envoie le cookie httpOnly
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      // Pas de session active — normal si non connecté
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    tryRefresh();
  }, [tryRefresh]);

  // ── Login ────────────────────────────────────────

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // reçoit le cookie refresh
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? "Identifiants incorrects");
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  // ── Logout ───────────────────────────────────────

  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}