const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown[],
  ) {
    super(message);
  }
}

type TokenGetter = () => Promise<string | null> | string | null;

let tokenGetter: TokenGetter = () => null;

export function setTokenGetter(fn: TokenGetter) {
  tokenGetter = fn;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await tokenGetter();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: { error?: { code?: string; message?: string; details?: unknown[] } } = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(
      body.error?.code ?? "HTTP_ERROR",
      body.error?.message ?? res.statusText,
      res.status,
      body.error?.details,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { API_BASE };
