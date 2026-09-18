import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-context";
import { authApi } from "@/services/auth-api";
import type { LoginRequest, RegisterRequest } from "@/types/auth";

/** Submission state for the login/register form. Errors are rethrown so the page can render them. */
export function useAuthForm() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (
      mode: "login" | "register",
      payload: LoginRequest | RegisterRequest,
    ) => {
      setIsSubmitting(true);

      try {
        if (mode === "login") {
          await authApi.login(payload as LoginRequest);
        } else {
          await authApi.register(payload as RegisterRequest);
        }
        await reloadUser();
        navigate("/", { replace: true });
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, reloadUser],
  );

  return { submit, isSubmitting };
}
