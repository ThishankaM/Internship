import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/providers/auth-context";
import { authApi } from "@/services/auth-api";
import { ApiError, setUnauthorizedHandler } from "@/services/api-client";
import type { RequestStatus } from "@/types/api";
import type { User } from "@/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Single global 401 handler for the whole app.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("idle");
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  const reloadUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      setStatus("success");
      setError(null);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Failed to load user");
    }
  }, []);

  // Load the current user once when the app starts with an existing token.
  useEffect(() => {
    if (!authApi.isAuthenticated()) return;

    let cancelled = false;

    authApi
      .getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Failed to load user");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setStatus("idle");
    setError(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "idle" || status === "loading",
        isError: status === "error",
        error,
        reloadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
