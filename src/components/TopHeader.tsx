import { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "../data/ThemeContext";
import { useAppData } from "../data/AppDataContext";
import { useAuth } from "../data/AuthContext";
import type { PageKey } from "../App";

interface Props {
  onNavigate: (page: PageKey) => void;
  visualVersion: "classic" | "studio";
  onToggleVersion: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  icon: string;
  page: PageKey;
}

interface Notif {
  id: string;
  icon: string;
  title: string;
  body: string;
  tone: "danger" | "warning" | "info";
  page: PageKey;
}

function buildResults(query: string, data: ReturnType<typeof useAppData>): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: SearchResult[] = [];
  data.customers
    .filter((c) => c.name.includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((c) => out.push({ id: `c-${c.id}`, label: c.name, sub: `${c.phone} · ${c.id}`, icon: "👤", page: "customers" }));
  data.vehicles
    .filter((v) => v.plate.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.owner.includes(q))
    .slice(0, 3)
    .forEach((v) => out.push({ id: `v-${v.vin}`, label: `${v.make} ${v.model} ${v.year}`, sub: `${v.plate} · ${v.owner}`, icon: "🚗", page: "cars" }));
  data.workOrders
    .filter((o) => o.id.toLowerCase().includes(q) || o.customer.includes(q) || o.car.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((o) => out.push({ id: `wo-${o.id}`, label: o.id, sub: `${o.customer} · ${o.car}`, icon: "🔧", page: "work-orders" }));
  data.parts
    .filter((p) => p.name.includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((p) => out.push({ id: `p-${p.sku}`, label: p.name, sub: `${p.brand} · ${p.sku}`, icon: "📦", page: "spare-parts" }));
  return out;
}

const TONE_STYLES: Record<string, string> = {
  danger:  "bg-rose-500/10 text-rose-500 border-rose-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  info:    "bg-sky-500/10 text-sky-500 border-sky-500/20",
};

export default function TopHeader({ onNavigate, visualVersion, onToggleVersion }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const data = useAppData();
  const isDark = theme === "dark";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── search ── */
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = buildResults(query, data);

  useEffect(() => {
    setSearchOpen(query.trim().length >= 2);
  }, [query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── notifications from real data ── */
  const notifs = useMemo<Notif[]>(() => {
    const list: Notif[] = [];

    const lowStock = data.parts.filter((p) => p.stock <= p.minStock);
    if (lowStock.length > 0) {
      list.push({
        id: "low-stock",
        icon: "📦",
        title: `${lowStock.length} قطع مخزونها منخفض`,
        body: lowStock.slice(0, 2).map((p) => p.name).join("، ") + (lowStock.length > 2 ? "…" : ""),
        tone: "danger",
        page: "spare-parts",
      });
    }

    const urgentOrders = data.workOrders.filter((o) => o.priority === "عاجل" && o.status !== "مكتمل");
    if (urgentOrders.length > 0) {
      list.push({
        id: "urgent-orders",
        icon: "🔧",
        title: `${urgentOrders.length} أوامر تشغيل عاجلة`,
        body: urgentOrders.slice(0, 2).map((o) => `${o.id} · ${o.customer}`).join("، "),
        tone: "danger",
        page: "work-orders",
      });
    }

    const debtors = data.customers.filter((c) => c.debt > 0);
    if (debtors.length > 0) {
      const total = debtors.reduce((s, c) => s + c.debt, 0);
      list.push({
        id: "debtors",
        icon: "💳",
        title: `${debtors.length} عملاء لديهم ديون`,
        body: `إجمالي: ${total.toLocaleString("ar-EG")} ر.س`,
        tone: "warning",
        page: "customers",
      });
    }

    const todayApts = data.appointments.filter((a) => a.day === 4);
    if (todayApts.length > 0) {
      list.push({
        id: "today-apts",
        icon: "📅",
        title: `${todayApts.length} مواعيد اليوم`,
        body: todayApts.slice(0, 2).map((a) => `${a.customer} · ${a.service}`).join("، "),
        tone: "info",
        page: "appointments",
      });
    }

    const waitingParts = data.workOrders.filter((o) => o.status === "انتظار قطع");
    if (waitingParts.length > 0) {
      list.push({
        id: "waiting-parts",
        icon: "⏳",
        title: `${waitingParts.length} أوامر تنتظر قطع غيار`,
        body: waitingParts.slice(0, 2).map((o) => o.car).join("، "),
        tone: "warning",
        page: "work-orders",
      });
    }

    return list.slice(0, 6);
  }, [data.parts, data.workOrders, data.customers, data.appointments]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const visible = notifs.filter((n) => !dismissed.has(n.id));

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function dismiss(id: string) { setDismissed((prev) => new Set([...prev, id])); }
  function dismissAll() { setDismissed(new Set(notifs.map((n) => n.id))); setNotifOpen(false); }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 bg-card border-b border-border/50" style={{ boxShadow: "var(--header-shadow)" }}>
      <button onClick={onToggleVersion} className="version-switch" aria-pressed={visualVersion === "studio"} title="التبديل بين التصميم الأصلي والتصميم الجديد">
        <span aria-hidden="true">✦</span><span>{visualVersion === "studio" ? "العودة للأصلية" : "جرّب التصميم الجديد"}</span>
      </button>
      {/* Greeting */}
      <div className="min-w-0">
        <h2 className="text-base font-bold text-foreground truncate">
          أهلاً {user?.name?.split(" ")[0] ?? "بك"} <span className="align-middle">👋</span>
        </h2>
        <p className="text-[11px] text-muted-foreground font-mono truncate">
          الأربعاء، ٢٧ أغسطس ٢٠٢٦
        </p>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center px-2">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="glow-search-poda w-full">
            <div className="glow-layer" />
            <div className="glow-darkBorderBg" />
            <div className="glow-white" />
            <div className="glow-border" />
            <div className="glow-search-main">
              <div className="glow-search-accent-spot" />
              <input
                type="search"
                aria-label="بحث"
                placeholder="ابحث عن عميل، سيارة، أمر تشغيل…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setQuery(""); setSearchOpen(false); } }}
                className="glow-search-input"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm z-10" aria-hidden="true">🔍</span>
            </div>
          </div>

          {searchOpen && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-40">
              {results.length > 0
                ? results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => { setQuery(""); setSearchOpen(false); onNavigate(r.page); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-secondary/60 transition-colors ${i > 0 ? "border-t border-border/40" : ""}`}
                    >
                      <span className="text-base flex-shrink-0">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{r.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.sub}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">←</span>
                    </button>
                  ))
                : (
                  <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                    لا توجد نتائج لـ &ldquo;{query}&rdquo;
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? "التبديل للوضع النهاري" : "التبديل للوضع الليلي"}
          className="relative w-14 h-7 rounded-full bg-secondary border border-border flex items-center transition-colors"
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] transition-all duration-300"
            style={{ right: isDark ? "2px" : "calc(100% - 22px)" }}
          >
            {isDark ? "🌙" : "☀️"}
          </span>
        </button>

        {/* User avatar + logout */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-secondary transition-colors border border-transparent hover:border-border"
            aria-label="قائمة المستخدم"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user?.avatar ?? user?.name?.[0] ?? "م"}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-foreground leading-none">{user?.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{user?.role}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-40" dir="rtl">
              <div className="px-4 py-3 border-b border-border/60">
                <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{user?.email}</div>
                <div className="text-[10px] mt-1 text-primary/70">{user?.role}</div>
              </div>
              <div className="p-1.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-right">
                  <span className="text-base">👤</span> الملف الشخصي
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-right">
                  <span className="text-base">⚙️</span> إعدادات الحساب
                </button>
                <div className="my-1 border-t border-border/60" />
                <button
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-right"
                >
                  <span className="text-base">🚪</span> تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            aria-label="الإشعارات"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 rounded-full bg-secondary/60 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <span className="text-sm" aria-hidden="true">🔔</span>
            {visible.length > 0 && (
              <>
                <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-rose-500/50 animate-ping" aria-hidden="true" />
                <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-rose-500 border border-card" />
              </>
            )}
          </button>

          {notifOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-40" dir="rtl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">الإشعارات</span>
                {visible.length > 0 && (
                  <button onClick={dismissAll} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    مسح الكل
                  </button>
                )}
              </div>

              {visible.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-3xl mb-2 opacity-40">🔔</div>
                  <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                  {visible.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors group">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${TONE_STYLES[n.tone]}`}>
                        {n.icon}
                      </span>
                      <button
                        className="flex-1 text-right min-w-0"
                        onClick={() => { setNotifOpen(false); onNavigate(n.page); }}
                      >
                        <div className="text-xs font-semibold text-foreground leading-snug">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</div>
                      </button>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-all text-xs mt-0.5"
                        aria-label="إغلاق"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
