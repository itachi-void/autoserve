import { useState, useRef, useEffect } from "react";
import type { PageKey } from "../App";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";

type Period = "هذا الأسبوع" | "هذا الشهر" | "آخر ٣ أشهر" | "هذا العام";

const PERIODS: Period[] = ["هذا الأسبوع", "هذا الشهر", "آخر ٣ أشهر", "هذا العام"];

const BAR_DATA: Record<Period, { label: string; revenue: number; orders: number }[]> = {
  "هذا الأسبوع": [
    { label: "سبت", revenue: 9200,  orders: 18 },
    { label: "أحد", revenue: 7800,  orders: 14 },
    { label: "اثن", revenue: 12400, orders: 24 },
    { label: "ثلا", revenue: 10600, orders: 20 },
    { label: "أرب", revenue: 15200, orders: 31 },
    { label: "خمس", revenue: 18100, orders: 37 },
    { label: "جمع", revenue: 4200,  orders: 8  },
  ],
  "هذا الشهر": [
    { label: "أسبوع ١", revenue: 58000, orders: 112 },
    { label: "أسبوع ٢", revenue: 74000, orders: 145 },
    { label: "أسبوع ٣", revenue: 66500, orders: 128 },
    { label: "أسبوع ٤", revenue: 77500, orders: 152 },
  ],
  "آخر ٣ أشهر": [
    { label: "يونيو",  revenue: 248000, orders: 482 },
    { label: "يوليو",  revenue: 312000, orders: 608 },
    { label: "أغسطس", revenue: 276000, orders: 537 },
  ],
  "هذا العام": [
    { label: "يناير",  revenue: 210000, orders: 410 },
    { label: "فبراير", revenue: 195000, orders: 380 },
    { label: "مارس",   revenue: 268000, orders: 523 },
    { label: "أبريل",  revenue: 301000, orders: 588 },
    { label: "مايو",   revenue: 284000, orders: 554 },
    { label: "يونيو",  revenue: 248000, orders: 482 },
    { label: "يوليو",  revenue: 312000, orders: 608 },
    { label: "أغسطس", revenue: 276000, orders: 537 },
  ],
};

const KPI_MULTIPLIER: Record<Period, number> = {
  "هذا الأسبوع": 1,
  "هذا الشهر": 4.3,
  "آخر ٣ أشهر": 13,
  "هذا العام": 34,
};

const APT_HOURS = ["٨:٠٠", "٩:٠٠", "١٠:٠٠", "١١:٠٠", "١٢:٠٠", "١:٠٠", "٢:٠٠", "٣:٠٠", "٤:٠٠", "٥:٠٠"];

interface Props {
  onNavigate: (page: PageKey) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { customers, workOrders, appointments, technicians } = useAppData();
  const [chartTab, setChartTab] = useState<"revenue" | "orders">("revenue");
  const [period, setPeriod] = useState<Period>("هذا الشهر");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mult = KPI_MULTIPLIER[period];
  const barDataCurrent = BAR_DATA[period];
  const maxRevenue = Math.max(...barDataCurrent.map((d) => d.revenue));
  const maxOrders  = Math.max(...barDataCurrent.map((d) => d.orders));

  const baseRevenue  = workOrders.filter((o) => o.status === "مكتمل").reduce((s, o) => s + o.total, 0);
  const activeOrders = workOrders.filter((o) => o.status === "جاري" || o.status === "انتظار قطع").length;
  const totalDebt    = customers.reduce((s, c) => s + c.debt, 0);
  const debtorCount  = customers.filter((c) => c.debt > 0).length;

  const kpis = [
    { label: "إجمالي الإيرادات", value: toArabicNum(Math.round(baseRevenue * mult)), unit: "ر.س", change: "+١٢.٥٪", up: true,  color: "amber",   icon: "💰", sub: period },
    { label: "أوامر التشغيل",    value: toArabicNum(Math.round(workOrders.length * mult)), unit: "أمر",  change: "+٨.٢٪",  up: true,  color: "sky",     icon: "🔧", sub: `نشطة الآن: ${toArabicNum(activeOrders)}` },
    { label: "العملاء",          value: toArabicNum(customers.length),                    unit: "عميل", change: "+٢٣",    up: true,  color: "emerald", icon: "👥", sub: "جديد هذا الأسبوع" },
    { label: "الديون المستحقة",  value: toArabicNum(totalDebt),                          unit: "ر.س",  change: "-٣.١٪",  up: false, color: "rose",    icon: "⚠️", sub: `${toArabicNum(debtorCount)} عميل` },
  ];

  const todayAppointments = appointments.filter((a) => a.day === 4);
  const recentOrders      = workOrders.slice(0, 5);

  const kpiAccent: Record<string, string> = {
    amber:   "from-amber-500 to-amber-400",
    sky:     "from-sky-500 to-sky-400",
    emerald: "from-emerald-500 to-emerald-400",
    rose:    "from-rose-500 to-rose-400",
  };
  const kpiGlow: Record<string, string> = {
    amber:   "bg-amber-400",
    sky:     "bg-sky-400",
    emerald: "bg-emerald-400",
    rose:    "bg-rose-400",
  };

  return (
    <div className="p-6 space-y-6 min-h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">الأربعاء، ٢٧ أغسطس ٢٠٢٦</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period filter dropdown */}
          <div ref={periodRef} className="relative">
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground flex items-center gap-2 hover:border-primary/40 hover:text-foreground transition-all"
            >
              <span className={`text-xs text-primary transition-transform duration-200 ${periodOpen ? "rotate-180" : ""}`}>▼</span>
              {period}
            </button>
            {periodOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20" dir="rtl">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                    className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                      p === period
                        ? "text-primary font-medium bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate("work-orders")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            + أمر تشغيل جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-200 relative">
            <div className={`h-[3px] bg-gradient-to-l ${kpiAccent[kpi.color]}`} />
            <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${kpiGlow[kpi.color]} opacity-[0.09] blur-2xl pointer-events-none`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${kpi.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground font-mono">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>
                <div className="text-sm text-muted-foreground">{kpi.label}</div>
                <div className="text-xs text-muted-foreground/60 font-mono">{kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Chart */}
        <div className="col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">الأداء — {period}</h2>
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              {(["revenue", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab === "revenue" ? "الإيرادات" : "الأوامر"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {barDataCurrent.map((d) => {
              const val    = chartTab === "revenue" ? d.revenue : d.orders;
              const maxVal = chartTab === "revenue" ? maxRevenue : maxOrders;
              const pct    = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {chartTab === "revenue" ? (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val)) : String(val)}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${chartTab === "revenue" ? "chart-bar-primary" : "chart-bar-accent"}`}
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Load */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">حمل الفنيين</h2>
          <div className="space-y-3">
            {technicians.map((t) => {
              const pct   = (t.tasks / t.maxTasks) * 100;
              const color = pct >= 100 ? "bg-rose-500" : pct >= 66 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={t.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{t.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{toArabicNum(t.tasks)}/{toArabicNum(t.maxTasks)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t.specialty}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Work Orders */}
        <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">آخر أوامر التشغيل</h2>
            <button onClick={() => onNavigate("work-orders")} className="text-xs text-primary hover:brightness-110 transition-colors">عرض الكل ←</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["رقم الأمر", "العميل", "السيارة", "الخدمة", "الفني", "الحالة", "المبلغ"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{o.id}</td>
                  <td className="px-4 py-3 text-foreground">{o.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{o.car}</td>
                  <td className="px-4 py-3 text-secondary-foreground text-xs">{o.services[0]}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{o.tech}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(o.total)} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Today Appointments */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">مواعيد اليوم</h2>
            <span className="text-xs font-mono bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              {toArabicNum(todayAppointments.length)} مواعيد
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {todayAppointments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">لا توجد مواعيد اليوم</p>
            ) : (
              todayAppointments.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <div className="text-xs font-mono text-primary w-14 shrink-0 pt-0.5">
                    {APT_HOURS[a.hour] ?? `${a.hour}:٠٠`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{a.customer}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.car} · {a.service}</div>
                  </div>
                  <StatusBadge status="قادم" className="shrink-0 text-[10px]" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
