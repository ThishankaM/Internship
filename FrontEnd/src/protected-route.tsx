import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/states/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/services/auth-api";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** Only allows ADMIN users through; everyone else is sent back to the board. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isError, loadCurrentUser } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    loadCurrentUser(controller.signal);
    return () => controller.abort();
  }, [loadCurrentUser]);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState message="Checking permissions..." />
      </div>
    );
  }

  if (isError || !user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
