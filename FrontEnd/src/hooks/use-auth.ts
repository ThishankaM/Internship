import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/auth-api";
import { setUnauthorizedHandler, ApiError } from "@/services/api-client";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";
import type { RequestStatus } from "@/types/api";

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Global 401 handler → kick the user back to login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  const loadCurrentUser = useCallback(async (signal?: AbortSignal) => {
    if (!authApi.isAuthenticated()) {
      setStatus("error");
      setError("Not authenticated");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const currentUser = await authApi.getCurrentUser(signal);
      setUser(currentUser);
      setStatus("success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Failed to load user");
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return {
    user,
    isLoading: status === "loading" || status === "idle",
    isError: status === "error",
    error,
    loadCurrentUser,
    logout,
  };
}

/** Separate hook for the login/register form with submission state. */
export function useAuthForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const submit = useCallback(
    async (mode: "login" | "register", payload: LoginRequest | RegisterRequest) => {
      setIsSubmitting(true);
      setError(null);
      setFieldErrors([]);

      try {
        if (mode === "login") {
          await authApi.login(payload as LoginRequest);
        } else {
          await authApi.register(payload as RegisterRequest);
        }
        navigate("/", { replace: true });
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          setFieldErrors(err.details ?? []);
        } else {
          setError("Unexpected error. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate]
  );

  return { submit, isSubmitting, error, fieldErrors, setError };
}