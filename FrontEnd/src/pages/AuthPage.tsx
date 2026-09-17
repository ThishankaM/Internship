import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/auth-api";
import { ApiError } from "@/services/api-client";
import { useAuthForm } from "@/hooks/use-auth-form";

type AuthMode = "login" | "register" | "forgot" | "reset";

interface AuthPageProps {
  mode?: AuthMode;
}

export default function AuthPage({ mode: initialMode = "login" }: AuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [issuedResetToken, setIssuedResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const { submit: submitCredentials } = useAuthForm();

  const resetLocalState = () => {
    setError(null);
    setFieldErrors([]);
    setIsSubmitting(false);
  };

  const handleCredentialSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetLocalState();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await submitCredentials("login", { email, password });
      } else {
        await submitCredentials("register", { name, email, password });
      }
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
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ email });
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setIssuedResetToken(response.resetToken);
        setMode("reset");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to request reset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token: resetToken,
        newPassword,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? []);
      } else {
        setError("Failed to reset password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    login: "Welcome Back",
    register: "Create Account",
    forgot: "Forgot Password",
    reset: "Reset Password",
  };

  const submitLabel: Record<AuthMode, string> = {
    login: "Login",
    register: "Register",
    forgot: "Send Reset Token",
    reset: "Reset Password",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-card-foreground">
          {titles[mode]}
        </h2>

        {issuedResetToken && mode === "reset" && (
          <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
            <p className="mb-1 font-medium text-primary">Simulated reset token</p>
            <p className="break-all text-xs text-muted-foreground">
              {issuedResetToken}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-1 list-inside list-disc">
                {fieldErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {mode === "login" || mode === "register" ? (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : submitLabel[mode]}
            </Button>
          </form>
        ) : mode === "forgot" ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : submitLabel[mode]}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-token">Reset Token</Label>
              <Input
                id="reset-token"
                required
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : submitLabel[mode]}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                  setFieldErrors([]);
                }}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
              <span className="mx-2">|</span>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setFieldErrors([]);
                }}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </>
          )}

          {mode === "register" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setFieldErrors([]);
              }}
              className="text-primary hover:underline"
            >
              Already have an account? Login
            </button>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
