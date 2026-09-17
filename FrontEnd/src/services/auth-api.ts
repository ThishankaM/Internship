import { apiClient } from "./api-client";
import { tokenStorage } from "@/lib/token-storage";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload, {
      auth: false,
    });
    tokenStorage.set(res.access_token);
    return res;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload, {
      auth: false,
    });
    tokenStorage.set(res.access_token);
    return res;
  },

  getCurrentUser(signal?: AbortSignal): Promise<User> {
    return apiClient.get<User>("/auth/me", { signal });
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};