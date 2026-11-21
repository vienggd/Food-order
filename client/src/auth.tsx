import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler } from "./api";

export type Role = "CUSTOMER" | "OPERATOR";
export type User = { id: number; name: string; role: Role };

export const homeFor = (role: Role) => (role === "OPERATOR" ? "/operator/orders" : "/menu");

type Auth = {
  user: User | null;
  loading: boolean;
  notice: string | null; // one-off message shown on the next screen
  setNotice: (n: string | null) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api<User>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    setUnauthorizedHandler(() => {
      setUser(null);
      setNotice("Your session has ended. Please log in again.");
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api<User>("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(u);
    setNotice(null);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null); // whatever the result, the client forgets the user
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, notice, setNotice, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const a = useContext(AuthContext);
  if (!a) throw new Error("useAuth outside AuthProvider");
  return a;
}
