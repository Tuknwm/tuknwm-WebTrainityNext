"use client";

// Mock authentication — replaces next-auth/react without any backend.
// Session is stored in localStorage and is lost when the browser clears storage.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserByEmail, addUser } from "@/lib/mockStore";

export interface MockUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface MockSession {
  user: MockUser;
  expires: string;
}

interface SessionContext {
  data: MockSession | null;
  status: "authenticated" | "unauthenticated" | "loading";
  update: (user: MockUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "trainity_session";

const Ctx = createContext<SessionContext>({
  data: null,
  status: "unauthenticated",
  update: () => {},
  logout: () => {},
});

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MockSession | null>(null);
  const [status, setStatus] = useState<"authenticated" | "unauthenticated" | "loading">("loading");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MockSession = JSON.parse(raw);
        setData(parsed);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  const update = useCallback((user: MockUser) => {
    const session: MockSession = {
      user,
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setData(session);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(null);
    setStatus("unauthenticated");
  }, []);

  return <Ctx.Provider value={{ data, status, update, logout }}>{children}</Ctx.Provider>;
}

// Drop-in replacement for next-auth/react's useSession
export function useSession() {
  const ctx = useContext(Ctx);
  return { data: ctx.data, status: ctx.status };
}

// Drop-in replacement for next-auth/react's signIn("credentials", ...)
export async function signIn(
  _provider: string,
  opts: { email: string; password: string; redirect?: boolean },
): Promise<{ error: string | null }> {
  const user = getUserByEmail(opts.email);
  if (!user) return { error: "Email tidak ditemukan" };
  if (user.password !== opts.password) return { error: "Password salah" };
  // Caller is responsible for calling ctx.update — but we can't access context here.
  // So we store in localStorage directly; the provider reads it on next render.
  const session: MockSession = {
    user: { id: user._id, username: user.username, name: user.username, email: user.email, role: user.role },
    expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return { error: null };
}

// Drop-in replacement for next-auth/react's signOut
export async function signOut(_opts?: { redirect?: boolean }) {
  localStorage.removeItem(STORAGE_KEY);
}

// Hook that gives access to update/logout actions
export function useMockAuth() {
  return useContext(Ctx);
}

// Mock register
export function mockRegister(username: string, email: string, password: string, confirm: string) {
  if (!username || !email || !password) throw new Error("Semua field wajib diisi");
  if (password.length < 8) throw new Error("Password minimal 8 karakter");
  if (password !== confirm) throw new Error("Konfirmasi password tidak cocok");
  addUser({ username, email, password, role: "user" });
}
