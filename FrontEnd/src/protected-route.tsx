import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/states/loading-state";
import { useAuth } from "@/providers/auth-context";
import { authApi } from "@/services/auth-api";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** Only allows ADMIN users through; everyone else is sent back to the board. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isError } = useAuth();

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
