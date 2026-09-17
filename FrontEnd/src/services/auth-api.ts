import { apiClient } from "./api-client";
import { tokenStorage } from "@/lib/token-storage";
import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload, {
      auth: false,
    });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) {
      tokenStorage.setRefresh(res.refresh_token);
    }
    return res;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload, {
      auth: false,
    });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) {
      tokenStorage.setRefresh(res.refresh_token);
    }
    return res;
  },

  getCurrentUser(signal?: AbortSignal): Promise<User> {
    return apiClient.get<User>("/auth/me", { signal });
  },

  changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/change-password", payload);
  },

  forgotPassword(
    payload: ForgotPasswordRequest,
  ): Promise<{ message: string; resetToken?: string }> {
    return apiClient.post<{ message: string; resetToken?: string }>(
      "/auth/forgot-password",
      payload,
      { auth: false },
    );
  },

  resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      "/auth/reset-password",
      payload,
      { auth: false },
    );
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};
