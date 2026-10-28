import { useEffect, useState, type ReactNode } from "react";
import { Activity, ArrowUpLeft, Bell, Boxes, CalendarDays, CarFront, ChevronDown, ClipboardCheck, CreditCard, FileText, Gauge, LayoutGrid, LogOut, Moon, Search, ShieldCheck, ShoppingBag, Sun, Users, Warehouse, Wrench, X, type LucideIcon } from "lucide-react";
import type { PageKey } from "../../App";
import { useAuth } from "../../data/AuthContext";
import { useAppData } from "../../data/AppDataContext";
import { useTheme } from "../../data/ThemeContext";
import { LogoOrbital } from "../logos/AutoServeLogo";

const modules: { key: PageKey; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "غرفة التحكم", icon: LayoutGrid },
  { key: "work-orders", label: "أوامر التشغيل", icon: Wrench },
  { key: "cars", label: "السيارات", icon: CarFront },
  { key: "customers", label: "العملاء", icon: Users },
  { key: "appointments", label: "المواعيد", icon: CalendarDays },
  { key: "inspections", label: "الفحوصات", icon: ClipboardCheck },
  { key: "technicians", label: "الفنيون", icon: Gauge },
  { key: "services", label: "الخدمات", icon: Activity },
  { key: "spare-parts", label: "قطع الغيار", icon: Boxes },
  { key: "quotations", label: "عروض الأسعار", icon: FileText },
  { key: "invoices", label: "الفواتير", icon: CreditCard },
  { key: "warehouse", label: "المخازن", icon: Warehouse },
  { key: "purchase-orders", label: "أوامر الشراء", icon: ShoppingBag },
  { key: "employees", label: "الموظفون", icon: Users },
  { key: "permissions", label: "الصلاحيات", icon: ShieldCheck },
];

export default function StudioShell({ activePage, onNavigate, children }: { activePage: PageKey; onNavigate: (page: PageKey, recordId?: string) => void; children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;
  const themeLabel = isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي";
  const { user, logout } = useAuth();
  const { parts, workOrders, customers, loading, pending, error, refresh, dataSource } = useAppData();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(() => localStorage.getItem("autoserve-nav-collapsed") !== "true");
  const [searchIndex, setSearchIndex] = useState(0);
  useEffect(() => { setSearchIndex(0); }, [query]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setQuery(""); setMenuOpen(false); setNoticesOpen(false); setProfileOpen(false); } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  useEffect(() => { const outside = (event: PointerEvent) => { const target = event.target as HTMLElement; if (!target.closest(".cockpit-popover-anchor")) { setNoticesOpen(false); setProfileOpen(false); } if (!target.closest(".cockpit-module-menu, .mobile-modules-toggle")) setMenuOpen(false); if (!target.closest(".cockpit-search")) setQuery(""); }; document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside); }, []);
  const title = modules.find(item => item.key === activePage)?.label;
  const shortages = parts.filter(part => part.stock <= part.minStock);
  const waiting = workOrders.filter(order => order.status === "انتظار قطع");
  const normalize = (value: string) => value.normalize("NFKC").replace(/[٠-٩]/g, character => String("٠١٢٣٤٥٦٧٨٩".indexOf(character))).replace(/[أإآ]/g, "ا").replace(/[\u064b-\u065f]/g, "").toLocaleLowerCase().trim();
  const matches = (value: string) => normalize(value).includes(normalize(query));
  const results: { label: string; sub: string; page: PageKey; recordId?: string }[] = query.trim() ? [
    ...modules.filter(item => matches(item.label)).map(item => ({ label: item.label, sub: "وحدة النظام", page: item.key })),
    ...customers.filter(customer => matches(`${customer.id} ${customer.name} ${customer.phone}`)).slice(0, 3).map(customer => ({ label: customer.name, sub: customer.phone, page: "customers" as PageKey, recordId: customer.id })),
    ...workOrders.filter(order => matches(`${order.id} ${order.car} ${order.customer}`)).slice(0, 3).map(order => ({ label: order.car, sub: order.id, page: "work-orders" as PageKey, recordId: order.id })),
  ].slice(0, 7) : [];

  return (
    <div className={`studio-experience cockpit-shell ${isDark ? "cockpit-dark" : "cockpit-light"} ${railExpanded ? "nav-expanded" : "nav-collapsed"}`} dir="rtl">
      <aside className="cockpit-rail" aria-label="وحدات النظام">
        <button className="cockpit-brand" onClick={() => onNavigate("dashboard")} aria-label="AutoServe الرئيسية"><LogoOrbital size={27} lightMode={!isDark} badgeMode /></button>
        <div className="rail-divider" />
        <button className="rail-expand" aria-expanded={railExpanded} aria-label={railExpanded ? "طي قائمة التنقل" : "توسيع قائمة التنقل"} onClick={() => { const next = !railExpanded; setRailExpanded(next); localStorage.setItem("autoserve-nav-collapsed", String(!next)); }}><LayoutGrid size={17} /><span>{railExpanded ? "طي القائمة" : "القائمة"}</span></button>
        <nav>{[{ label: "مساحة العمل", keys: ["dashboard"] }, { label: "التشغيل", keys: ["work-orders", "appointments", "inspections", "technicians", "services"] }, { label: "العملاء", keys: ["customers", "cars", "quotations"] }, { label: "المالية والمخزون", keys: ["invoices", "spare-parts", "warehouse", "purchase-orders"] }, { label: "الإدارة", keys: ["employees", "permissions"] }].map(group => <div className="rail-group" key={group.label}><h2>{group.label}</h2>{modules.filter(module => group.keys.includes(module.key)).map(({ key, label, icon: Icon }) => <button key={key} aria-label={label} title={railExpanded ? undefined : label} aria-current={activePage === key ? "page" : undefined} className={activePage === key ? "active" : ""} onClick={() => onNavigate(key)}><Icon size={19} strokeWidth={1.6} /><span className="rail-label">{label}</span>{!railExpanded && <span className="rail-tooltip">{label}</span>}</button>)}</div>)}</nav>
        <button className="rail-return" onClick={toggleTheme} title={themeLabel} aria-label={themeLabel}><ThemeIcon size={20} /></button>
        <span className="rail-version">02</span>
      </aside>
      <div className="cockpit-workspace">
        <header className="cockpit-header">
          <button className="cockpit-wordmark" onClick={() => onNavigate("dashboard")}>auto<span>serve</span><small>WORKSHOP OS</small></button>
          <div className="cockpit-header-center"><span className="cockpit-divider" /><span className="cockpit-location"><span className="signal-dot" /> مركز الصيانة <small>مساحة العمل</small></span></div>
          <div className="cockpit-actions">
            <button className="cockpit-theme" onClick={toggleTheme} aria-label={themeLabel}><ThemeIcon size={14} />{isDark ? "الوضع النهاري" : "الوضع الليلي"}</button>
            <div className="cockpit-popover-anchor"><button className="cockpit-icon-button" aria-label="تنبيهات التشغيل" aria-expanded={noticesOpen} onClick={() => { setNoticesOpen(!noticesOpen); setProfileOpen(false); }}><Bell size={18} />{(shortages.length > 0 || waiting.length > 0) && <i />}</button>{noticesOpen && <div className="cockpit-popover"><div className="popover-title">تنبيهات التشغيل<button aria-label="إغلاق التنبيهات" onClick={() => setNoticesOpen(false)}><X size={16} /></button></div><button onClick={() => { onNavigate("spare-parts"); setNoticesOpen(false); }}><Boxes size={18} /><span>{shortages.length.toLocaleString("ar-SA")} قطع عند حد إعادة الطلب<small>مراجعة المخزون والتوريد</small></span></button><button onClick={() => { onNavigate("work-orders"); setNoticesOpen(false); }}><Wrench size={18} /><span>{waiting.length.toLocaleString("ar-SA")} أوامر بانتظار قطع<small>متابعة السيارات المتوقفة</small></span></button></div>}</div>
            <div className="cockpit-popover-anchor"><button className="cockpit-user" aria-expanded={profileOpen} onClick={() => { setProfileOpen(!profileOpen); setNoticesOpen(false); }}><span>{user?.avatar || user?.name.charAt(0)}</span><div>{user?.name}<small>{user?.role}</small></div><ChevronDown size={13} /></button>{profileOpen && <div className="cockpit-popover"><div className="popover-title">{user?.name}</div><p className="profile-email">{user?.email}</p><button onClick={logout}><LogOut size={17} />تسجيل الخروج</button></div>}</div>
          </div>
        </header>
        <div className="cockpit-navigation">
          <nav className="cockpit-tabs" aria-label="اختصارات التشغيل">{modules.filter(item => ["work-orders", "appointments", "customers"].includes(item.key)).map(({ key, label, icon: Icon }) => <button key={key} className={activePage === key ? "active" : ""} onClick={() => onNavigate(key)}><Icon size={15} />{label}</button>)}<button className="mobile-modules-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><LayoutGrid size={15} />الوحدات<ChevronDown size={12} /></button></nav>
          <div className="cockpit-search"><Search size={16} /><input role="combobox" aria-expanded={Boolean(query.trim())} aria-controls="workspace-search-results" aria-autocomplete="list" aria-activedescendant={results.length ? `workspace-result-${searchIndex}` : undefined} aria-label="بحث في العملاء والأوامر والوحدات" placeholder="عميل، سيارة أو رقم أمر…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setSearchIndex(previous => results.length ? (previous + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : 0); } if (event.key === "Enter" && results[searchIndex]) { event.preventDefault(); const result = results[searchIndex]; onNavigate(result.page, result.recordId); setQuery(""); } }} />{query && <button aria-label="مسح البحث" onClick={() => setQuery("")}><X size={14} /></button>}{query.trim() && <div id="workspace-search-results" role="listbox" aria-label="نتائج البحث" className="cockpit-search-results">{results.length ? results.map((result, index) => <button id={`workspace-result-${index}`} role="option" aria-selected={index === searchIndex} key={`${result.label}-${index}`} onClick={() => { onNavigate(result.page, result.recordId); setQuery(""); }}><span>{result.label}<small>{result.sub}</small></span><ArrowUpLeft size={15} /></button>) : <p role="status">لا توجد نتائج مطابقة. جرّب الاسم أو رقم الأمر.</p>}</div>}</div>
        </div>
        {menuOpen && <div className="cockpit-module-menu">{modules.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => { onNavigate(key); setMenuOpen(false); }}><Icon size={19} /><span>{label}</span><ArrowUpLeft size={14} /></button>)}</div>}
        <main className={`cockpit-content ${activePage !== "dashboard" ? "cockpit-module-content" : ""}`} key={activePage} aria-busy={loading || pending}>
          {dataSource === "api" && <div className="workspace-api-status" role={error ? "alert" : "status"}><span>{loading ? "جاري تحميل مساحة العمل…" : pending ? "جاري حفظ التغييرات…" : error ? error : "البيانات محدثة"}</span>{!loading && !pending && refresh && <button onClick={() => void refresh()}>{error ? "إعادة المحاولة" : "تحديث"}</button>}</div>}
          {activePage !== "dashboard" && <div className="cockpit-module-heading module-breadcrumb"><span>مساحة العمل / {title}</span><button onClick={() => onNavigate("dashboard")}>غرفة التحكم <ArrowUpLeft size={15} /></button></div>}
          {loading ? <div className="workspace-loading" role="status">جاري تحميل وحدات النظام…</div> : <fieldset disabled={pending} className="workspace-content-fieldset">{children}</fieldset>}
        </main>
      </div>
    </div>
  );
}
