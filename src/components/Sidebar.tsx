import { useLayoutEffect, useRef, useState } from "react";
import type { PageKey } from "../App";
import { useAppData } from "../data/AppDataContext";
import { useAuth } from "../data/AuthContext";
import { LogoOrbital } from "./logos/AutoServeLogo";

interface NavItem {
  key: PageKey;
  label: string;
  icon: string;
  badge?: (data: ReturnType<typeof useAppData>) => number | null;
  group?: string;
}

const navItems: NavItem[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: "⊞", group: "رئيسي" },
  { key: "permissions", label: "الصلاحيات", icon: "🔐", group: "إدارة" },
  { key: "employees", label: "الموظفون", icon: "🏢", group: "إدارة" },
  {
    key: "customers",
    label: "العملاء",
    icon: "👥",
    badge: (d) => { const n = d.customers.filter((c) => c.debt > 0).length; return n || null; },
    group: "العمليات",
  },
  { key: "cars", label: "السيارات", icon: "🚗", group: "العمليات" },
  {
    key: "spare-parts",
    label: "قطع الغيار",
    icon: "⚙️",
    badge: (d) => { const n = d.parts.filter((p) => p.stock < p.minStock).length; return n || null; },
    group: "العمليات",
  },
  { key: "services", label: "الخدمات", icon: "🛠️", group: "العمليات" },
  { key: "appointments", label: "المواعيد", icon: "📅", group: "الورشة" },
  { key: "technicians", label: "الفنيون", icon: "👷", group: "الورشة" },
  { key: "inspections", label: "الفحوصات", icon: "🔍", group: "الورشة" },
  {
    key: "quotations",
    label: "عروض الأسعار",
    icon: "📋",
    badge: (d) => { const n = d.quotations.filter((q) => q.status === "معلق").length; return n || null; },
    group: "الورشة",
  },
  {
    key: "work-orders",
    label: "أوامر التشغيل",
    icon: "🔧",
    badge: (d) => { const n = d.workOrders.filter((o) => o.status === "جاري" || o.status === "انتظار قطع").length; return n || null; },
    group: "الورشة",
  },
  { key: "invoices", label: "الفواتير", icon: "🧾", group: "المالية" },
  { key: "warehouse", label: "المخازن والتوريد", icon: "📦", group: "المالية" },
  {
    key: "purchase-orders",
    label: "أوامر الشراء",
    icon: "🛒",
    badge: (d) => { const n = d.purchaseOrders.filter((o) => o.status === "معلق").length; return n || null; },
    group: "المالية",
  },
];

const groups = ["رئيسي", "إدارة", "العمليات", "الورشة", "المالية"];

interface Props {
  activePage: PageKey;
  setActivePage: (p: PageKey) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  noTransition?: boolean;
}

export default function Sidebar({ activePage, setActivePage, open, setOpen, noTransition }: Props) {
  const data = useAppData();
  const { logout } = useAuth();

  // Single sliding active-tab indicator: measure the active button's vertical
  // position/height within the (position: relative) <nav> and let CSS animate
  // the indicator's top/height so the curved tab glides between items.
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = itemRefs.current.get(activePage);
    if (el) {
      const next = { top: el.offsetTop, height: el.offsetHeight };
      setIndicator((prev) =>
        prev && prev.top === next.top && prev.height === next.height ? prev : next
      );
    }
  });

  return (
    <aside
      className={`fixed top-0 right-0 h-full z-40 flex flex-col overflow-hidden${noTransition ? "" : " transition-all duration-300"}`}
      style={{
        width: open ? "260px" : "72px",
        background: "var(--sidebar-bg)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                <LogoOrbital size={24} badgeMode />
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">AutoServe</div>
                <div className="text-[10px] text-primary font-mono uppercase tracking-widest">Pro SaaS</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-white transition-colors text-xs"
            >
              ◀
            </button>
          </>
        ) : (
          <button onClick={() => setOpen(true)} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto">
            <LogoOrbital size={24} badgeMode />
          </button>
        )}
      </div>

      {/* Profile */}
      <div className={`flex flex-col items-center text-center gap-2 px-4 py-4 border-b border-white/10 flex-shrink-0 ${!open ? "px-0" : ""}`}>
        <div className={`rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white/15 ${open ? "w-14 h-14 text-lg" : "w-9 h-9 text-sm mx-auto"}`}>
          م
        </div>
        {open && (
          <div className="min-w-0 w-full">
            <div className="text-sm font-semibold text-white truncate">محمد أحمد</div>
            <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">mohamed@autoserve.sa</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 py-3 px-3 overflow-y-auto hide-scrollbar space-y-0.5">
        {indicator && (
          <div
            className="sidebar-tab-indicator"
            style={{ top: indicator.top, height: indicator.height }}
          />
        )}
        <div className={`sidebar-glider-container${open ? "" : " is-collapsed"}`}>
          {indicator && (
            <div
              className="sidebar-glider"
              style={{ top: indicator.top, height: indicator.height }}
            />
          )}
        </div>
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              {open && (
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-3 pt-3 pb-1">
                  {group}
                </div>
              )}
              {!open && <div className="border-t border-border/50 my-1.5" />}
              {items.map((item) => {
                const active = activePage === item.key;
                const badgeCount = item.badge ? item.badge(data) : null;
                return (
                  <button
                    key={item.key}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.key, el);
                      else itemRefs.current.delete(item.key);
                    }}
                    onClick={() => setActivePage(item.key)}
                    className={`box-border flex items-center gap-3 w-full max-w-full rounded-full ${open ? "px-3" : "px-0 justify-center"} py-2 text-sm font-medium transition-colors duration-200 relative z-10 border border-transparent
                      ${active
                        ? ""
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    style={active ? { color: "var(--sidebar-active-text)" } : undefined}
                    title={!open ? item.label : undefined}
                  >
                    <span
                      className={`text-base flex-shrink-0 transition-transform duration-200 ${active ? "scale-105" : ""}`}
                      style={active ? { filter: "drop-shadow(0 0 5px var(--sidebar-active-text))" } : undefined}
                    >{item.icon}</span>
                    {open && (
                      <>
                        <span
                          className="flex-1 text-right text-xs"
                          style={active ? { textShadow: "0 0 12px var(--sidebar-active-text)" } : undefined}
                        >{item.label}</span>
                        {badgeCount !== null && (
                          <span className="relative flex-shrink-0">
                            <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
                            <span className="relative bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-mono">
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                    {!open && badgeCount !== null && (
                      <span className="absolute top-1 left-1">
                        <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
                        <span className="relative bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                          {badgeCount > 9 ? "!" : badgeCount}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <button
          onClick={logout}
          aria-label="تسجيل الخروج"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors ${!open ? "justify-center" : ""}`}
          title={!open ? "تسجيل الخروج" : undefined}
        >
          <span className="text-base flex-shrink-0" aria-hidden="true">⏻</span>
          {open && <span className="flex-1 text-right text-xs font-medium">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
