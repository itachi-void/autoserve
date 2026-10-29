const STORAGE_API_KEY = "autoserve_api_endpoint";

export function getActiveApiUrl(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(STORAGE_API_KEY)?.trim();
    if (custom) return custom;
  }
  return (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "";
}

export function setActiveApiUrl(url: string) {
  if (typeof window !== "undefined") {
    if (url.trim()) {
      localStorage.setItem(STORAGE_API_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_API_KEY);
    }
  }
}

export const API_ENABLED = getActiveApiUrl().length > 0;

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const endpoint = getActiveApiUrl();
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    const crossOrigin = new URL(endpoint, window.location.href).origin !== window.location.origin;
    throw new ApiError(
      crossOrigin
        ? `تعذّر الاتصال بالـ API (${endpoint}). تحقق من تشغيل الخادم والسماح بعنوان الواجهة في CORS: ${window.location.origin}`
        : "تعذّر الاتصال بالخادم، تحقق من الاتصال وحاول مجدداً",
      "NETWORK",
    );
  }

  if (res.status === 401) throw new ApiError("انتهت الجلسة، يرجى تسجيل الدخول مجدداً", "UNAUTHENTICATED");
  if (res.status === 429) throw new ApiError("طلبات كثيرة خلال وقت قصير؛ انتظر دقيقة وحاول مجدداً", "RATE_LIMITED");

  const body = (await res.json().catch(() => null)) as {
    data?: T;
    errors?: { message: string; extensions?: { code?: string } }[];
  } | null;

  if (!body) throw new ApiError(`الخادم أعاد استجابة غير صالحة (HTTP ${res.status}). تحقق من عنوان GraphQL ومسار الاتصال.`, "BAD_RESPONSE");
  if (body.errors?.length) {
    const first = body.errors[0];
    const code = first.extensions?.code;
    const message =
      code === "AUTH_NOT_AUTHENTICATED"
        ? "انتهت الجلسة، يرجى تسجيل الدخول مجدداً"
        : code === "AUTH_NOT_AUTHORIZED"
          ? "ليست لديك صلاحية لتنفيذ هذا الإجراء"
          : first.message;
    throw new ApiError(message, code === "AUTH_NOT_AUTHENTICATED" ? "UNAUTHENTICATED" : code);
  }
  return body.data as T;
}
