import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { API_ENABLED, ApiError, gql, setAccessToken } from "./api";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar: string;
  accessToken?: string;
  expiresOn?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** API: mutation login(input: LoginInput!) { authPayload { accessToken expiresOn } } */
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  startTrial: (input: { companyName: string; email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  /** API: mutation forgetPassword(input: ForgetPasswordInput!) — sends OTP to email */
  sendOtp: (email: string) => Promise<{ ok: boolean; error?: string }>;
  /** API: mutation resetPassword(input: ResetPasswordInput!) { email, otp, newPassword } */
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  /** API: mutation refreshToken(input: RefreshTokenInput!) { token } */
  refreshToken: (token: string) => Promise<{ ok: boolean }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* Demo accounts — mirrors what createEmployeeAccount would produce in the backend */
const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@fixsys.sa": {
    password: "admin123",
    user: {
      name: "أحمد المدير",
      email: "admin@fixsys.sa",
      role: "مدير النظام",
      avatar: "أ",
      accessToken: "demo_token_admin",
      expiresOn: "2026-09-28T00:00:00Z",
    },
  },
  "manager@fixsys.sa": {
    password: "manager123",
    user: {
      name: "محمد المشرف",
      email: "manager@fixsys.sa",
      role: "مشرف العمليات",
      avatar: "م",
      accessToken: "demo_token_manager",
      expiresOn: "2026-09-28T00:00:00Z",
    },
  },
};

const SESSION_KEY = "fixsys_auth";

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) as AuthUser : null;
    if (API_ENABLED && session?.accessToken?.startsWith("demo_token_")) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  manager: "مشرف العمليات",
  accountant: "محاسب",
  receptionist: "موظف استقبال",
  technician: "فني",
};

interface ApiAuthPayload {
  accessToken: string;
  expiresOn: string;
  user: { name: string; email: string; roles: string[] };
}

const AUTH_PAYLOAD_FIELDS = "authPayload { accessToken expiresOn user { name email roles } }";

function toAuthUser(p: ApiAuthPayload): AuthUser {
  return {
    name: p.user.name,
    email: p.user.email,
    role: ROLE_LABELS[p.user.roles[0]] ?? p.user.roles[0] ?? "",
    avatar: p.user.name.trim().charAt(0),
    accessToken: p.accessToken,
    expiresOn: p.expiresOn,
  };
}

function errorMessage(e: unknown) {
  return e instanceof ApiError ? e.message : "حدث خطأ غير متوقع، حاول مجدداً";
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = loadSession();
    if (API_ENABLED) setAccessToken(session?.accessToken ?? null);
    return session;
  });
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function persist(next: AuthUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    if (API_ENABLED) setAccessToken(next.accessToken ?? null);
    setUser(next);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("activePage");
    setAccessToken(null);
    setUser(null);
  }

  async function login(email: string, password: string) {
    if (API_ENABLED) {
      try {
        const data = await gql<{ login: { authPayload: ApiAuthPayload } }>(
          `mutation ($input: LoginInput!) { login(input: $input) { ${AUTH_PAYLOAD_FIELDS} } }`,
          { input: { email: email.trim(), password } },
        );
        persist(toAuthUser(data.login.authPayload));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errorMessage(e) };
      }
    }

    await delay(700);
    const entry = DEMO_USERS[email.trim().toLowerCase()];
    if (!entry || entry.password !== password) {
      return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    persist(entry.user);
    return { ok: true };
  }

  async function startTrial(input: { companyName: string; email: string; password: string }) {
    if (!API_ENABLED) return { ok: false, error: "إنشاء تجربة مستقلة يحتاج اتصالاً بالباك اند" };
    try {
      const data = await gql<{ createTrial: { authPayload: ApiAuthPayload } }>(`mutation($input: CreateTrialInput!) { createTrial(input: $input) { ${AUTH_PAYLOAD_FIELDS} } }`, { input });
      persist(toAuthUser(data.createTrial.authPayload));
      localStorage.setItem("activePage", "dashboard");
      return { ok: true };
    } catch (cause) { return { ok: false, error: errorMessage(cause) }; }
  }

  function logout() {
    clearSession();
  }

  async function sendOtp(email: string) {
    if (API_ENABLED) {
      try {
        await gql(
          `mutation ($input: ForgetPasswordInput!) { forgetPassword(input: $input) { success } }`,
          { input: { email: email.trim() } },
        );
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errorMessage(e) };
      }
    }

    await delay(900);
    const known = Object.keys(DEMO_USERS).includes(email.trim().toLowerCase());
    if (!known) return { ok: false, error: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني" };
    return { ok: true };
  }

  async function resetPassword(email: string, otp: string, newPassword: string) {
    if (API_ENABLED) {
      try {
        await gql(
          `mutation ($input: ResetPasswordInput!) { resetPassword(input: $input) { success } }`,
          { input: { email: email.trim(), otp: otp.trim(), newPassword } },
        );
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errorMessage(e) };
      }
    }

    await delay(800);
    if (otp !== "123456") return { ok: false, error: "كود التحقق غير صحيح أو انتهت صلاحيته" };
    const entry = DEMO_USERS[email.trim().toLowerCase()];
    if (!entry) return { ok: false, error: "البريد الإلكتروني غير مسجل" };
    return { ok: true };
  }

  async function refreshToken(token: string) {
    if (!API_ENABLED) return { ok: true };
    try {
      const data = await gql<{ refreshToken: { authPayload: ApiAuthPayload } }>(
        `mutation ($input: RefreshTokenInput!) { refreshToken(input: $input) { ${AUTH_PAYLOAD_FIELDS} } }`,
        { input: { token } },
      );
      persist(toAuthUser(data.refreshToken.authPayload));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  // Keep the session alive: refresh one minute before expiry (or immediately if already expired).
  useEffect(() => {
    clearTimeout(refreshTimer.current);
    if (!API_ENABLED || !user?.accessToken || !user.expiresOn) return;

    const wait = Math.max(0, new Date(user.expiresOn).getTime() - Date.now() - 60_000);
    refreshTimer.current = setTimeout(async () => {
      const res = await refreshToken(user.accessToken!);
      if (!res.ok) clearSession();
    }, wait);
    return () => clearTimeout(refreshTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken, user?.expiresOn]);

  return (
    <AuthContext.Provider value={{ user, login, startTrial, logout, sendOtp, resetPassword, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
