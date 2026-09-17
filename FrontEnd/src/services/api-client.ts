import { tokenStorage } from "@/lib/token-storage";
import type { ApiErrorShape } from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** Custom error so components/hooks can inspect status codes. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

/** Called by the client whenever a 401 is received (set by the auth layer). */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach Bearer token (default true)
  signal?: AbortSignal;
}

async function request<TResponse>(
  endpoint: string,
  { method = "GET", body, auth = true, signal }: RequestOptions = {}
): Promise<TResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    // Network failure / server down
    throw new ApiError(
      "Unable to reach the server. Please check your connection.",
      0
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorBody = payload as ApiErrorShape | null;
    const rawMessage = errorBody?.message;
    const details = Array.isArray(rawMessage) ? rawMessage : undefined;
    const message = Array.isArray(rawMessage)
      ? rawMessage[0]
      : rawMessage ?? "Something went wrong. Please try again.";

    if (response.status === 401) {
      tokenStorage.clear();
      onUnauthorized?.();
    }

    throw new ApiError(message, response.status, details);
  }

  return payload as TResponse;
}

export const apiClient = {
  get: <T>(endpoint: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...opts, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(endpoint, { ...opts, method: "POST", body }),

  patch: <T>(endpoint: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(endpoint, { ...opts, method: "PATCH", body }),

  delete: <T>(endpoint: string, opts?: RequestOptions) =>
    request<T>(endpoint, { ...opts, method: "DELETE" }),
};