import { useState, type ReactNode } from "react";
import {
  LayoutGrid,
  Wrench,
  ClipboardCheck,
  CarFront,
  Menu,
  X,
  Users,
  CalendarDays,
  Gauge,
  Activity,
  Boxes,
  FileText,
  CreditCard,
  Warehouse,
  ShoppingBag,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Server,
  type LucideIcon,
} from "lucide-react";
import type { PageKey } from "../../App";
import { useAuth } from "../../data/AuthContext";
import { useTheme } from "../../data/ThemeContext";
import ServerConnectionModal from "../ui/ServerConnectionModal";

interface MobileNavBarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "التحكم", icon: LayoutGrid },
  { key: "work-orders", label: "الأوامر", icon: Wrench },
  { key: "inspections", label: "الفحوصات", icon: ClipboardCheck },
  { key: "cars", label: "السيارات", icon: CarFront },
];

const SECONDARY_MODULES: { key: PageKey; label: string; icon: LucideIcon; category: string }[] = [
  { key: "customers", label: "العملاء", icon: Users, category: "العملاء" },
  { key: "appointments", label: "المواعيد", icon: CalendarDays, category: "التشغيل" },
  { key: "technicians", label: "الفنيون", icon: Gauge, category: "التشغيل" },
  { key: "services", label: "الخدمات", icon: Activity, category: "التشغيل" },
  { key: "spare-parts", label: "قطع الغيار", icon: Boxes, category: "المخزون والمالية" },
  { key: "quotations", label: "عروض الأسعار", icon: FileText, category: "المخزون والمالية" },
  { key: "invoices", label: "الفواتير", icon: CreditCard, category: "المخزون والمالية" },
  { key: "warehouse", label: "المخازن", icon: Warehouse, category: "المخزون والمالية" },
  { key: "purchase-orders", label: "أوامر الشراء", icon: ShoppingBag, category: "المخزون والمالية" },
  { key: "employees", label: "الموظفون", icon: Users, category: "الإدارة" },
  { key: "permissions", label: "الصلاحيات", icon: ShieldCheck, category: "الإدارة" },
];

export default function MobileNavBar({ activePage, onNavigate }: MobileNavBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;

  const isPrimaryActive = PRIMARY_NAV_ITEMS.some((item) => item.key === activePage);

  const handleSelect = (key: PageKey) => {
    onNavigate(key);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ── Fixed Bottom Bar for Mobile Viewports ── */}
      <nav
        aria-label="شريط التنقل السفلي"
        className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl md:hidden px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom,10px),10px)]"
        dir="rtl"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {PRIMARY_NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? "text-primary font-bold scale-105"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                </div>
                <span className="text-[11px] mt-0.5 leading-tight">{label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              !isPrimaryActive || drawerOpen
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                !isPrimaryActive || drawerOpen ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              <Menu size={20} strokeWidth={!isPrimaryActive || drawerOpen ? 2.2 : 1.7} />
            </div>
            <span className="text-[11px] mt-0.5 leading-tight">المزيد</span>
            {!isPrimaryActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Full "More" Drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="bg-card border-t border-border rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user?.avatar || user?.name?.charAt(0) || "A"}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{user?.name || "المستخدم"}</h3>
                  <p className="text-xs text-muted-foreground">{user?.role || "فني معتمد"}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium border border-border"
              >
                <ThemeIcon size={15} />
                <span>{isDark ? "الوضع النهاري" : "الوضع الليلي"}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20"
              >
                <LogOut size={15} />
                <span>خروج</span>
              </button>
            </div>

            <button
              onClick={() => setShowServerModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-secondary/80 text-foreground text-xs font-semibold border border-border hover:bg-secondary transition-colors"
            >
              <Server size={14} className="text-primary" />
              <span>إعدادات ربط الخادم (Backend Settings)</span>
            </button>

            {/* Modules Grid */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                جميع وحدات النظام
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SECONDARY_MODULES.map(({ key, label, icon: Icon }) => {
                  const isActive = activePage === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-right transition-all border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/40 hover:bg-secondary text-foreground border-border/60"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isActive ? "bg-white/20 text-white" : "bg-card text-primary"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ServerConnectionModal open={showServerModal} onClose={() => setShowServerModal(false)} />
    </>
  );
}
