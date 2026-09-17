import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { authApi } from "@/services/auth-api";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
