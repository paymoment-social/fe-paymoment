export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    request_id: string;
  };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string> = {},
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.paymom3nts.xyz").replace(/\/$/, "");

const FALLBACK_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Please sign in and try again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource could not be found.",
  CONFLICT: "This action conflicts with the current data. Refresh and try again.",
  VALIDATION_ERROR: "Some information is invalid. Review the highlighted fields and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  STORAGE_ERROR: "Media storage is temporarily unavailable. Please try again.",
  NETWORK_ERROR: "Unable to reach PayMoment. Check your connection and try again.",
  INVALID_RESPONSE: "PayMoment returned an invalid response. Please try again.",
  UNKNOWN_ERROR: "The request could not be completed. Please try again.",
};

function publicErrorMessage(status: number, code: string, message?: string) {
  if (typeof message === "string" && message.trim() && message.length <= 300) return message;
  return FALLBACK_ERROR_MESSAGES[code] ?? (status >= 500
    ? "PayMoment is temporarily unavailable. Please try again."
    : FALLBACK_ERROR_MESSAGES.UNKNOWN_ERROR);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Unable to reach PayMoment. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null) as T | ApiErrorPayload | null;
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload ? payload.error : undefined;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      publicErrorMessage(response.status, error?.code ?? "UNKNOWN_ERROR", error?.message),
      error?.fields,
      error?.request_id,
    );
  }
  if (!payload) throw new ApiError(response.status, "INVALID_RESPONSE", "PayMoment returned an invalid response.");
  return payload as T;
}

export function mutationHeaders(idempotencyKey = crypto.randomUUID()) {
  return { "Idempotency-Key": idempotencyKey };
}
