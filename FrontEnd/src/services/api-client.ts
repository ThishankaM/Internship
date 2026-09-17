import { tokenStorage } from "@/lib/token-storage";
import type { ApiErrorShape } from "@/types/api";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

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

/** Called by the client whenever a 401 can't be recovered (set by the auth layer). */
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

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

/* -------------------------------------------------------------------------- */
/*                         Refresh token queue (Phase 08)                     */
/* -------------------------------------------------------------------------- */

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let refreshFailures: ((error: unknown) => void)[] = [];

function subscribeToRefresh(
  resolve: (token: string) => void,
  reject: (error: unknown) => void
): void {
  refreshSubscribers.push(resolve);
  refreshFailures.push(reject);
}

function resolveRefreshQueue(token: string): void {
  refreshSubscribers.forEach((resolve) => resolve(token));
  refreshSubscribers = [];
  refreshFailures = [];
}

function rejectRefreshQueue(error: unknown): void {
  refreshFailures.forEach((reject) => reject(error));
  refreshSubscribers = [];
  refreshFailures = [];
}

function forceLogout(): void {
  tokenStorage.clear();
  if (onUnauthorized) {
    onUnauthorized();
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) {
    throw new ApiError("Session expired", 401);
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new ApiError("Session expired", response.status);
  }

  const data = (await response.json()) as RefreshResponse;
  tokenStorage.set(data.access_token);
  if (data.refresh_token) {
    tokenStorage.setRefresh(data.refresh_token);
  }
  return data.access_token;
}

/**
 * Ensures only one refresh request runs at a time. Concurrent 401s wait on the
 * same promise and then retry with the freshly issued access token.
 */
async function getFreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      subscribeToRefresh(resolve, reject);
    });
  }

  isRefreshing = true;

  try {
    const token = await refreshAccessToken();
    isRefreshing = false;
    resolveRefreshQueue(token);
    return token;
  } catch (err) {
    isRefreshing = false;
    rejectRefreshQueue(err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Request                                  */
/* -------------------------------------------------------------------------- */

async function request<TResponse>(
  endpoint: string,
  { method = "GET", body, auth = true, signal }: RequestOptions = {}
): Promise<TResponse> {
  const buildHeaders = (token: string | null): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(token && auth ? { Authorization: `Bearer ${token}` } : {}),
  });

  const send = (token: string | null): Promise<Response> =>
    fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: buildHeaders(token),
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response: Response;

  try {
    response = await send(tokenStorage.get());
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(
      "Unable to reach the server. Please check your connection.",
      0
    );
  }

  // ---- Phase 08: refresh + retry once on 401 ----
  if (response.status === 401 && auth) {
    if (!tokenStorage.getRefresh()) {
      forceLogout();
      throw new ApiError("Unauthorized", 401);
    }

    let newToken: string;
    try {
      newToken = await getFreshToken();
    } catch (err) {
      forceLogout();
      throw err instanceof ApiError
        ? err
        : new ApiError("Session expired", 401);
    }

    try {
      response = await send(newToken);
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      throw new ApiError(
        "Unable to reach the server. Please check your connection.",
        0
      );
    }
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
      forceLogout();
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
