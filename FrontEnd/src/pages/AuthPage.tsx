import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { animate, stagger } from "animejs";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
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

const TITLES: Record<AuthMode, string> = {
  login: "Welcome back",
  register: "Create your account",
  forgot: "Reset your password",
  reset: "Set a new password",
};

const SUBTITLES: Record<AuthMode, string> = {
  login: "Sign in to pick up where you left off.",
  register: "Start organizing your work in a few seconds.",
  forgot: "We'll issue a reset token for your account.",
  reset: "Choose a new password to secure your account.",
};

const SUBMIT_LABELS: Record<AuthMode, string> = {
  login: "Login",
  register: "Register",
  forgot: "Send Reset Token",
  reset: "Reset Password",
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function AuthPage({
  mode: initialMode = "login",
}: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [flashMessage, setFlashMessage] = useState<string | null>(
    () => (location.state as { message?: string } | null)?.message ?? null,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [issuedResetToken, setIssuedResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const { submit: submitCredentials } = useAuthForm();

  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const blobOneRef = useRef<HTMLDivElement>(null);
  const blobTwoRef = useRef<HTMLDivElement>(null);

  // Wordmark: jump up, fall, squash on landing and settle.
  useEffect(() => {
    if (!wordmarkRef.current) return;

    const jump = animate(wordmarkRef.current, {
      keyframes: [
        { translateY: 110, opacity: 0, scaleY: 0.9, scaleX: 1.06, duration: 1 },
        {
          translateY: -22,
          opacity: 1,
          scaleY: 1.05,
          scaleX: 0.97,
          duration: 460,
          ease: "outQuad",
        },
        { translateY: 0, scaleY: 1, scaleX: 1, duration: 380, ease: "inQuad" },
        {
          translateY: 0,
          scaleY: 0.84,
          scaleX: 1.14,
          duration: 130,
          ease: "outQuad",
        },
        { translateY: 0, scaleY: 1, scaleX: 1, duration: 680, ease: "outBack" },
      ],
    });

    const shadow = shadowRef.current
      ? animate(shadowRef.current, {
          keyframes: [
            { scaleX: 0.45, opacity: 0.06, duration: 1 },
            { scaleX: 1, opacity: 0.34, duration: 460, ease: "outQuad" },
            { scaleX: 1, opacity: 0.34, duration: 380, ease: "inQuad" },
            {
              scaleX: 1.15,
              opacity: 0.5,
              duration: 130,
              ease: "outQuad",
            },
            { scaleX: 1, opacity: 0.32, duration: 680, ease: "outBack" },
          ],
        })
      : null;

    return () => {
      jump.revert();
      shadow?.revert();
    };
  }, []);

  // Card entrance.
  useEffect(() => {
    if (prefersReducedMotion() || !cardRef.current) return;

    const animation = animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [32, 0],
      duration: 700,
      delay: 320,
      ease: "outExpo",
    });

    return () => {
      animation.revert();
    };
  }, []);

  // Re-stagger the fields whenever the mode (or the banner) changes.
  useEffect(() => {
    if (prefersReducedMotion() || !formRef.current) return;

    const fields = Array.from(
      formRef.current.querySelectorAll("[data-animate-field]"),
    );
    if (fields.length === 0) return;

    const animation = animate(fields, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 520,
      delay: stagger(70),
      ease: "outQuad",
    });

    return () => {
      animation.revert();
    };
  }, [mode, flashMessage]);

  // Ambient floating background shapes.
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const blobs = [blobOneRef.current, blobTwoRef.current].filter(
      (element): element is HTMLDivElement => element !== null,
    );
    if (blobs.length === 0) return;

    const animation = animate(blobs, {
      translateY: [0, -30],
      translateX: [0, 18],
      scale: [1, 1.08],
      duration: 7000,
      delay: stagger(900),
      loop: true,
      alternate: true,
      ease: "inOutSine",
    });

    return () => {
      animation.revert();
    };
  }, []);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setFieldErrors([]);
    setFlashMessage(null);
  };

  const handleCredentialSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors([]);
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
      setError(
        err instanceof ApiError ? err.message : "Failed to request reset",
      );
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
      await authApi.resetPassword({ token: resetToken, newPassword });
      const message =
        "Password reset successful. Please log in with your new password.";
      setError(null);
      setFieldErrors([]);
      setMode("login");
      setFlashMessage(message);
      navigate("/login", { replace: true, state: { message } });
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

  const isCredentialMode = mode === "login" || mode === "register";

  const submitButton = (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="h-11 w-full text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:opacity-90 active:scale-[0.99]"
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--primary), var(--secondary-accent))",
      }}
    >
      {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
      {isSubmitting ? "Please wait..." : SUBMIT_LABELS[mode]}
    </Button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        ref={blobOneRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        ref={blobTwoRef}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-secondary-accent/20 blur-3xl"
      />

      <div className="relative grid min-h-screen md:grid-cols-2">
        {/* Decorative left panel */}
        <div className="relative hidden overflow-hidden border-r border-border/60 md:block">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 25%, var(--primary), transparent 55%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <div className="relative flex h-full flex-col justify-end p-12">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plan, track and finish your work — one board for every task,
              category and deadline.
            </p>
          </div>
        </div>

        {/* Right column: wordmark + auth card, vertically centered */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="flex w-full max-w-xl flex-col items-center">
            <div className="relative mb-12 flex flex-col items-center">
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2">
                <div
                  ref={shadowRef}
                  aria-hidden="true"
                  className="h-3.5 w-56 rounded-full bg-primary/30 blur-md"
                />
              </div>
              <h1
                ref={wordmarkRef}
                style={{
                  fontSize: "clamp(3.5rem, 6vw, 6.5rem)",
                  lineHeight: 1,
                }}
                className="font-black tracking-tight whitespace-nowrap text-foreground"
              >
                Task<span className="text-primary">Flow</span>
              </h1>
            </div>

            <div
              ref={cardRef}
              className="w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl ring-1 ring-foreground/5 backdrop-blur-xl"
            >
              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
                  {TITLES[mode]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {SUBTITLES[mode]}
                </p>
              </div>

              {flashMessage && (
                <div className="mb-5 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
                  {flashMessage}
                </div>
              )}

              {issuedResetToken && mode === "reset" && (
                <div className="mb-5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
                  <p className="mb-1 font-medium text-primary">
                    Simulated reset token
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {issuedResetToken}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
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

              <div ref={formRef}>
                {isCredentialMode ? (
                  <form onSubmit={handleCredentialSubmit} className="space-y-4">
                    {mode === "register" && (
                      <div className="space-y-2" data-animate-field>
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            required
                            autoComplete="name"
                            placeholder="Ada Lovelace"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-11 pl-9"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2" data-animate-field>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="h-11 pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2" data-animate-field>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete={
                            mode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-11 px-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div data-animate-field>{submitButton}</div>
                  </form>
                ) : mode === "forgot" ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-2" data-animate-field>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="h-11 pl-9"
                        />
                      </div>
                    </div>

                    <div data-animate-field>{submitButton}</div>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="space-y-2" data-animate-field>
                      <Label htmlFor="reset-token">Reset Token</Label>
                      <Input
                        id="reset-token"
                        required
                        placeholder="Paste your reset token"
                        value={resetToken}
                        onChange={(event) => setResetToken(event.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2" data-animate-field>
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          className="h-11 px-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div data-animate-field>{submitButton}</div>
                  </form>
                )}
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                    <span className="mx-2 opacity-50">•</span>
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}

                {mode === "register" && (
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-primary hover:underline"
                  >
                    Already have an account? Login
                  </button>
                )}

                {(mode === "forgot" || mode === "reset") && (
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-primary hover:underline"
                  >
                    Back to login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
