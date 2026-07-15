const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

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

let cachedToken: { value: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (DEV_AUTH) return null;

  const now = Date.now();
  if (cachedToken && cachedToken.exp > now + 30_000) {
    return cachedToken.value;
  }

  const res = await fetch("/api/session/token", { credentials: "include", cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) return null;

  // Cache ~4 min (typical access token 5–60m; refresh via session endpoint)
  cachedToken = { value: body.access_token, exp: now + 4 * 60_000 };
  return body.access_token;
}

export function clearTokenCache() {
  cachedToken = null;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !DEV_AUTH) {
    clearTokenCache();
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/login";
    }
  }

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
