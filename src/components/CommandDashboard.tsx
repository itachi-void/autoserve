import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleDot, Clock3, Expand, Focus, Gauge, Layers3, ListFilter, Package, Plus, RotateCcw, ScanLine, ShieldCheck, Users, Wrench, X } from "lucide-react";
import type { PageKey } from "../App";
import { useAppData } from "../data/AppDataContext";
import { useAuth } from "../data/AuthContext";
import StatusBadge from "./ui/StatusBadge";

const number = (value: number) => value.toLocaleString("ar-SA");
const steps = ["الاستقبال", "التشخيص", "الصيانة", "التسليم"];

export default function CommandDashboard({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { workOrders, customers, technicians, parts } = useAppData();
  const { user } = useAuth();
  const [filter, setFilter] = useState("الكل");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState("نظرة عامة");
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setExpanded(false); setHotspot(null); }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);
  const selected = workOrders.find(order => order.id === selectedId) ?? workOrders.find(order => order.status === "جاري") ?? workOrders[0];
  const active = workOrders.filter(order => order.status === "جاري" || order.status === "انتظار قطع");
  const waiting = workOrders.filter(order => order.status === "انتظار قطع");
  const completed = workOrders.filter(order => order.status === "مكتمل");
  const revenue = completed.reduce((total, order) => total + order.total, 0);
  const visibleOrders = workOrders.filter(order => filter === "الكل" || order.status === filter);
  const lowStock = parts.filter(part => part.stock <= part.minStock);
  const technician = technicians.find(tech => tech.name === selected?.tech);
  const stageIndex = selected ? selected.status === "مكتمل" ? 3 : selected.progress >= 40 ? 2 : selected.progress > 0 ? 1 : 0 : -1;
  const chooseOrder = (id: string) => { setSelectedId(id); setHotspot(null); };
  const cycleOrder = (direction: number) => {
    if (!workOrders.length) return;
    const current = workOrders.findIndex(order => order.id === selected?.id);
    chooseOrder(workOrders[(current + direction + workOrders.length) % workOrders.length].id);
  };

  return (
    <div className="atelier-dashboard">
      <div className="atelier-titlebar"><div><span className="atelier-kicker"><span /> WORKSHOP COMMAND CENTER</span><h1>ورشتك تتحرك. <span>وأنت ترى كل شيء.</span></h1><p>أهلاً {user?.name.split(" ")[0]}، هذه صورة مركزك الآن.</p></div><div className="atelier-title-actions"><span className="atelier-date">{new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long", calendar: "gregory" }).format(new Date())}</span><button className="atelier-add" onClick={() => onNavigate("work-orders")}><Plus size={17} /> أوامر التشغيل <ArrowUpLeft size={16} /></button></div></div>
      <section className="atelier-overview" aria-label="ملخص التشغيل"><div className="overview-tag"><span className="signal-dot" /><span>نظرة تشغيلية<small>من بيانات النظام</small></span></div>{[
        { label: "سيارات تحت الصيانة", value: active.length, unit: "سيارة", page: "work-orders" as PageKey, accent: true },
        { label: "بانتظار قطع الغيار", value: waiting.length, unit: "أمر", page: "spare-parts" as PageKey, accent: false },
        { label: "أوامر مكتملة", value: completed.length, unit: "أمر", page: "work-orders" as PageKey, accent: false },
        { label: "قيمة الأوامر المكتملة", value: revenue, unit: "ر.س", page: "invoices" as PageKey, accent: false },
      ].map(item => <button key={item.label} className={item.accent ? "overview-stat accent" : "overview-stat"} onClick={() => onNavigate(item.page)}><span>{item.label}<ArrowUpLeft size={12} /></span><strong>{number(item.value)}<small>{item.unit}</small></strong></button>)}</section>
      <div className="atelier-cockpit-grid">
        <aside className="atelier-telemetry">
          <section className="telemetry-pass"><span className="atelier-kicker">SERVICE PASSPORT</span><div className="passport-top"><span className="passport-icon"><ShieldCheck size={23} /></span><span>بطاقة الصيانة<small>الأمر المحدد</small></span></div><h2>{selected?.car ?? "لا توجد سيارات"}</h2><span className="passport-id" dir="ltr">{selected?.id ?? "—"}</span><div className="passport-rule" /><dl><div><dt>العميل</dt><dd>{selected?.customer ?? "—"}</dd></div><div><dt>الفني المسؤول</dt><dd>{selected?.tech ?? "غير محدد"}</dd></div><div><dt>قيمة الأمر</dt><dd className="passport-price">{number(selected?.total ?? 0)} <small>ر.س</small></dd></div></dl>{selected && <StatusBadge status={selected.status} />}</section>
          <section className="telemetry-dial"><div className="telemetry-label"><Gauge size={16} /><span>تقدم الصيانة</span></div><div className="dial-face"><svg viewBox="0 0 140 140" role="img" aria-label={`تقدم الأمر ${selected?.progress ?? 0} بالمائة`}><circle className="dial-track" cx="70" cy="70" r="58" /><circle className="dial-fill" cx="70" cy="70" r="58" pathLength="100" strokeDasharray={`${selected?.progress ?? 0} 100`} /></svg><div><strong>{number(selected?.progress ?? 0)}<small>٪</small></strong><span>من أعمال الأمر</span></div></div><span className="dial-caption"><CircleDot size={12} />{selected?.status ?? "بانتظار أول أمر"}</span></section>
          <button className="telemetry-parts" onClick={() => onNavigate("spare-parts")}><Package size={20} /><span>جاهزية المخزون<strong>{number(lowStock.length)} قطع تحتاج متابعة</strong></span><ArrowUpLeft size={16} /></button>
        </aside>
        <section className={`atelier-vehicle ${expanded ? "is-expanded" : ""}`} aria-label="مساحة عرض السيارة">
          <div className="vehicle-toolbar"><div><span className="atelier-kicker">VEHICLE STUDIO / 01</span><span className="vehicle-toolbar-title">مساحة الصيانة</span></div><div><button title="إعادة ضبط العرض" aria-label="إعادة ضبط العرض" onClick={() => { setView("نظرة عامة"); setHotspot(null); }}><RotateCcw size={15} /></button><button title={expanded ? "إغلاق العرض الموسع" : "توسيع العرض"} aria-label={expanded ? "إغلاق العرض الموسع" : "توسيع العرض"} onClick={() => setExpanded(!expanded)}>{expanded ? <X size={17} /> : <Expand size={16} />}</button></div></div>
          <div className="vehicle-mode-tabs" role="group" aria-label="وضع عرض السيارة">{[{ label: "نظرة عامة", icon: Layers3 }, { label: "تفاصيل الصيانة", icon: Wrench }, { label: "الفحص", icon: ScanLine }].map(({ label, icon: Icon }) => <button key={label} className={view === label ? "active" : ""} aria-pressed={view === label} onClick={() => { setView(label); setHotspot(null); }}><Icon size={14} />{label}</button>)}</div>
          <div className={`vehicle-scene ${view === "الفحص" ? "scan-mode" : ""}`}>
            <div className="vehicle-ghost-word" aria-hidden="true">PRECISION</div><div className="vehicle-platform" /><div className="vehicle-platform-ring" /><div className="vehicle-floor-lines" />
            {!imageFailed ? <img className="vehicle-cutout" src="/images/studio-vehicle.webp" alt="نموذج مرسيدس توضيحي لعرض الصيانة، وليس صورة السيارة المحددة" onError={() => setImageFailed(true)} /> : <div className="vehicle-image-fallback"><Gauge size={90} /><span>مساحة عرض السيارة</span></div>}
            {view === "الفحص" && <div className="vehicle-scan-beam" aria-hidden="true" />}
            <button className={`vehicle-hotspot hotspot-service ${hotspot === "service" ? "active" : ""}`} onClick={() => setHotspot(hotspot === "service" ? null : "service")} aria-expanded={hotspot === "service"}><span /><span className="hotspot-label"><Wrench size={12} />الخدمات المطلوبة</span></button>
            <button className={`vehicle-hotspot hotspot-parts ${hotspot === "parts" ? "active" : ""}`} onClick={() => setHotspot(hotspot === "parts" ? null : "parts")} aria-expanded={hotspot === "parts"}><span /><span className="hotspot-label"><Package size={12} />قطع الغيار</span></button>
            <span className="scene-coordinate coordinate-top">01 / SERVICE VIEW</span><span className="scene-coordinate coordinate-bottom">نموذج توضيحي · ليس تصويراً للسيارة</span>
            {hotspot && <div className="vehicle-hotspot-popover"><div><strong>{hotspot === "service" ? "الخدمات المطلوبة" : "قطع الغيار المرتبطة"}</strong><button onClick={() => setHotspot(null)} aria-label="إغلاق التفاصيل"><X size={14} /></button></div>{(hotspot === "service" ? selected?.services : selected?.parts)?.length ? <ul>{(hotspot === "service" ? selected?.services : selected?.parts)?.map((item, index) => <li key={`${item}-${index}`}><CircleDot size={12} />{item}</li>)}</ul> : <p>لا توجد عناصر مسجلة لهذا الأمر.</p>}</div>}
            {view === "تفاصيل الصيانة" && !hotspot && <div className="vehicle-service-overlay"><span>الخدمة المطلوبة</span><strong>{selected?.services.join(" · ") || "لا توجد خدمات مسجلة"}</strong><small>{selected?.notes || "لا توجد ملاحظات إضافية على الأمر"}</small></div>}
            {view === "الفحص" && !hotspot && <button className="vehicle-inspection-overlay" onClick={() => onNavigate("inspections")}><ScanLine size={20} /><span>تقارير الفحص<small>افتح وحدة الفحص للاطلاع على النتائج</small></span><ArrowUpLeft size={18} /></button>}
          </div>
          <div className="vehicle-selected-info"><div><span>السيارة المحددة</span><h2 key={selected?.id}>{selected?.car || "أضف أول أمر تشغيل"}</h2><p>{selected?.services.join(" / ") || "ابدأ بتنظيم أعمال مركزك"}</p></div><div className="vehicle-cycle"><button onClick={() => cycleOrder(-1)} aria-label="الأمر السابق" disabled={!workOrders.length}><ChevronRight size={18} /></button><span>{number(Math.max(0, workOrders.findIndex(order => order.id === selected?.id) + 1))}<small> / {number(workOrders.length)}</small></span><button onClick={() => cycleOrder(1)} aria-label="الأمر التالي" disabled={!workOrders.length}><ChevronLeft size={18} /></button></div></div>
          <div className="vehicle-assignment"><span><span className="assignment-avatar">{selected?.tech.charAt(0) || "—"}</span><span>{selected?.tech || "لم يتم تعيين فني"}<small>{technician?.specialty || "الفني المسؤول"}</small></span></span><button onClick={() => onNavigate("work-orders")}>إدارة الأمر <ArrowUpLeft size={15} /></button></div>
        </section>
        <section className="atelier-queue"><div className="queue-heading"><div><span className="atelier-kicker">IN THE WORKSHOP</span><h2>السيارات في المركز <span>{number(workOrders.length)}</span></h2></div><ListFilter size={17} /></div><div className="queue-filters" role="group" aria-label="تصفية السيارات">{["الكل", "جاري", "انتظار قطع", "مكتمل"].map(label => <button key={label} aria-pressed={filter === label} className={filter === label ? "active" : ""} onClick={() => setFilter(label)}>{label}</button>)}</div><div className="queue-list">{visibleOrders.map((order, index) => <button className={`queue-vehicle ${selected?.id === order.id ? "active" : ""}`} key={order.id} onClick={() => chooseOrder(order.id)} aria-pressed={selected?.id === order.id}><div className="queue-vehicle-top"><span className="queue-index">{String(index + 1).padStart(2, "0")}</span><StatusBadge status={order.status} /><ArrowUpLeft size={14} /></div><div className="queue-car-image"><img src="/images/studio-vehicle.webp" alt="نموذج سيارة توضيحي" loading="lazy" /></div><div className="queue-car-title"><h3>{order.car}</h3><span dir="ltr">{order.id}</span></div><div className="queue-car-footer"><span>{order.customer}</span><strong>{number(order.progress)}٪</strong></div><progress value={order.progress} max="100" aria-label={`تقدم صيانة ${order.car}`} /></button>)}{!visibleOrders.length && <div className="queue-empty"><Focus size={30} /><p>لا توجد سيارات بهذه الحالة.</p><button onClick={() => setFilter("الكل")}>عرض الكل</button></div>}</div><button className="queue-see-all" onClick={() => onNavigate("work-orders")}>كل أوامر التشغيل <ArrowUpLeft size={15} /></button></section>
      </div>
      <div className="atelier-lower-grid">
        <section className="atelier-journey"><div className="journey-heading"><div><span className="atelier-kicker">FROM ARRIVAL TO HANDOVER</span><h2>رحلة الصيانة</h2></div><span><Clock3 size={14} />تصور تقريبي حسب تقدم الأمر</span></div><div className="journey-track">{steps.map((step, index) => <div className={`journey-stop ${index < stageIndex ? "done" : ""} ${index === stageIndex ? "current" : ""}`} key={step}><span className="journey-node">{index < stageIndex || (index === 3 && selected?.status === "مكتمل") ? <Check size={16} /> : String(index + 1).padStart(2, "0")}</span><div><strong>{step}</strong><small>{index < stageIndex ? "مرحلة سابقة" : index === stageIndex ? selected?.status === "مكتمل" ? "مكتمل" : "المرحلة الحالية" : "المرحلة التالية"}</small></div></div>)}</div><div className="journey-note"><span><CircleDot size={12} />{selected?.status === "انتظار قطع" ? "العمل متوقف لحين توفير القطع المطلوبة" : selected?.notes || "تابع تفاصيل التنفيذ من أوامر التشغيل"}</span><button onClick={() => onNavigate("work-orders")}><ArrowUpLeft size={16} /></button></div></section>
        <section className="atelier-stock-alert"><div className="stock-alert-top"><span className="stock-alert-icon"><Package size={19} /></span><span>قبل أن تتوقف الصيانة</span><ArrowUpRight size={19} /></div><div className="stock-alert-number">{number(lowStock.length)}<span>قطع عند حد<br />إعادة الطلب</span></div><button onClick={() => onNavigate("spare-parts")}>راجع المخزون الآن <ArrowDownLeft size={19} /></button><div className="stock-alert-rings" aria-hidden="true" /></section>
      </div>
      <section className="atelier-team"><div className="atelier-team-heading"><Users size={18} /><div><h2>الفريق خلف الإنجاز</h2><span>{number(technicians.length)} فنيين · {number(customers.length)} عملاء</span></div></div><div className="atelier-team-members">{technicians.slice(0, 4).map(tech => <button key={tech.id} onClick={() => onNavigate("technicians")}><span className="atelier-team-avatar">{tech.name.charAt(0)}<i className={tech.status === "نشط" ? "available" : ""} /></span><div><strong>{tech.name}</strong><small>{tech.specialty}</small></div><span className="team-task-count">{number(tech.tasks)} مهام</span></button>)}</div><button className="team-all" onClick={() => onNavigate("technicians")} aria-label="إدارة جميع الفنيين"><ArrowUpLeft size={20} /></button></section>
      <footer className="atelier-footer"><span><span className="signal-dot" /> AUTOSERVE STUDIO <i>/</i> WORKSHOP EXPERIENCE 02</span><span>نفس البيانات. منظور مختلف.</span></footer>
    </div>
  );
}
