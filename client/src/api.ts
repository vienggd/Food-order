// One way to call the API. Errors always become ApiError with the server's code and message.
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: unknown = null,
  ) {
    super(message);
  }
}

export const NETWORK_MESSAGE = "Something went wrong. Please try again.";

// Set by AuthProvider: a 401 on any call (except login) means the session has ended.
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method ?? "GET",
      headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "NETWORK", NETWORK_MESSAGE);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (res.ok) return data as T;

  const err = data?.error;
  if (!err) throw new ApiError(res.status, "NETWORK", NETWORK_MESSAGE);
  if (res.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/me") onUnauthorized();
  throw new ApiError(res.status, err.code, err.message, err.details);
}
