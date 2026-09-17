export interface ApiErrorShape {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
}