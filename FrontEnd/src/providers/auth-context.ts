import { createContext, useContext } from "react";
import type { User } from "@/types/auth";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reloadUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
