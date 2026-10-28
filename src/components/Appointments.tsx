import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import PageHeader from "./ui/PageHeader";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import StatusBadge from "./ui/StatusBadge";
import { useToast } from "../data/ToastContext";
import { useConfirm } from "../data/ConfirmContext";
import type { Appointment } from "../data/types";

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const hours = Array.from({ length: 10 }, (_, index) => index + 8);
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const duration = (value?: string) => Number(value?.replace(/[٠-٩]/g, character => String("٠١٢٣٤٥٦٧٨٩".indexOf(character))).match(/[\d.]+/)?.[0]) || 1;
const clock = (date: Date) => date.toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" });

export default function Appointments() {
  const { appointments: allAppointments, customers, vehicles, services, technicians, addAppointment, cancelAppointment, pending } = useAppData();
  const toast = useToast();
  const confirm = useConfirm();
  const [anchorDate, setAnchorDate] = useState(() => localDate(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => (new Date().getDay() + 1) % 7);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customer: "", car: "", service: "", tech: "", date: localDate(new Date()), time: "09:00", duration: "1" });
  const currentWeek = new Date(); currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 1) % 7)); currentWeek.setHours(0, 0, 0, 0);
  const weekStart = new Date(`${anchorDate}T12:00:00`); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 1) % 7)); weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const dateForDay = (index: number) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return date; };
  const scheduledDate = (appointment: Appointment) => { if (appointment.scheduledAt) return new Date(appointment.scheduledAt); const date = new Date(currentWeek); date.setDate(date.getDate() + appointment.day); date.setHours(8 + appointment.hour); return date; };
  const appointments = allAppointments.filter(item => scheduledDate(item) >= weekStart && scheduledDate(item) < weekEnd && item.displayStatus !== "ملغي");
  const dailyAppointments = appointments.filter(item => localDate(scheduledDate(item)) === localDate(dateForDay(selectedDay))).sort((first, second) => +scheduledDate(first) - +scheduledDate(second));
  const conflicts = (start: Date, tech: string) => tech && allAppointments.some(item => {
    if (item.tech !== tech || ["ملغي", "مكتمل", "لم يحضر"].includes(item.displayStatus ?? "")) return false;
    const other = scheduledDate(item); return +start < +other + duration(item.estimatedDuration) * 3600000 && +start + Number(form.duration) * 3600000 > +other;
  });
  const moveWeek = (offset: number) => { const date = new Date(weekStart); date.setDate(date.getDate() + offset * 7); setAnchorDate(localDate(date)); };
  const openBooking = (date = dateForDay(selectedDay), hour?: number) => {
    const target = new Date(date); target.setHours(hour ?? 9, 0, 0, 0);
    if (hour === undefined && target < new Date()) { const now = new Date(); target.setTime(+now); target.setHours(now.getHours() + 1, 0, 0, 0); if (target.getHours() >= 18 || target.getHours() < 8) { target.setDate(target.getDate() + (target.getHours() >= 18 ? 1 : 0)); target.setHours(9, 0, 0, 0); } }
    setForm({ customer: "", car: "", service: "", tech: "", date: localDate(target), time: `${String(target.getHours()).padStart(2, "0")}:00`, duration: "1" }); setFormError(""); setShowAdd(true);
  };
  const suggestTime = () => {
    for (const hour of hours) { const start = new Date(`${form.date}T${String(hour).padStart(2, "0")}:00:00`); if (start > new Date() && !conflicts(start, form.tech)) { setForm(previous => ({ ...previous, time: `${String(hour).padStart(2, "0")}:00` })); setFormError("تم اختيار وقت متاح؛ راجع البيانات ثم أكد الحجز."); return; } }
    setFormError("لا يوجد وقت متاح لهذا الفني في اليوم المحدد. اختر يوماً أو فنياً آخر.");
  };
  const saveAppointment = async () => {
    if (saving || pending) return;
    if (!form.customer || !form.car || !form.service || !form.date || !form.time) { setFormError("اختر العميل والسيارة والخدمة وتاريخ ووقت الحجز."); return; }
    const scheduled = new Date(`${form.date}T${form.time}:00`);
    if (!Number.isFinite(+scheduled) || scheduled < new Date()) { setFormError("اختر تاريخاً ووقتاً قادماً للحجز."); return; }
    if (conflicts(scheduled, form.tech)) { setFormError("الفني لديه حجز يتداخل مع هذا الموعد. غيّر الوقت أو الفني، أو جرّب وقتاً متاحاً."); return; }
    setSaving(true); setFormError("");
    try {
      if ((await addAppointment({ id: `APT-${Date.now()}`, customer: form.customer, car: form.car, service: form.service, tech: form.tech || "غير مسند", scheduledAt: scheduled.toISOString(), day: (scheduled.getDay() + 1) % 7, hour: scheduled.getHours() - 8, estimatedDuration: form.duration, displayStatus: "قادم", color: "sky" })) === false) return;
      setAnchorDate(form.date); setSelectedDay((scheduled.getDay() + 1) % 7); toast("تم حجز الموعد بنجاح"); setShowAdd(false);
    } finally { setSaving(false); }
  };
  const cancel = async (appointment: Appointment) => {
    if (await confirm({ title: "إلغاء الموعد", message: `إلغاء حجز ${appointment.customer} في ${clock(scheduledDate(appointment))}؟`, confirmLabel: "إلغاء الموعد", danger: true })) {
      if ((await cancelAppointment(appointment.id)) === false) return;
      setSelectedAppointment(null); toast("تم إلغاء الموعد", "warning");
    }
  };

  return <div className="p-6 space-y-6" dir="rtl">
    <PageHeader title="إدارة المواعيد" subtitle={`${toArabicNum(appointments.length)} حجز هذا الأسبوع`} actions={<button onClick={() => openBooking()} className="workspace-primary-action"><Plus size={17} />حجز موعد</button>} />
    <div className="calendar-toolbar"><div><button onClick={() => moveWeek(-1)} aria-label="الأسبوع السابق"><ChevronRight size={18} /></button><button onClick={() => { setAnchorDate(localDate(new Date())); setSelectedDay((new Date().getDay() + 1) % 7); }}>اليوم</button><button onClick={() => moveWeek(1)} aria-label="الأسبوع التالي"><ChevronLeft size={18} /></button></div><strong>{weekStart.toLocaleDateString("ar-SA", { day: "numeric", month: "long", calendar: "gregory" })} — {dateForDay(6).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric", calendar: "gregory" })}</strong><label><CalendarDays size={17} /><span className="sr-only">انتقل إلى تاريخ</span><input type="date" value={anchorDate} onChange={event => { if (event.target.value) { setAnchorDate(event.target.value); setSelectedDay((new Date(`${event.target.value}T12:00:00`).getDay() + 1) % 7); } }} /></label></div>
    <div className="calendar-week"><div className="calendar-days">{days.map((day, index) => <button key={day} aria-pressed={selectedDay === index} className={selectedDay === index ? "selected" : ""} onClick={() => setSelectedDay(index)}><span>{day}</span><strong>{dateForDay(index).toLocaleDateString("ar-SA", { day: "numeric", calendar: "gregory" })}</strong><small>{toArabicNum(appointments.filter(item => localDate(scheduledDate(item)) === localDate(dateForDay(index))).length)} حجز</small></button>)}</div><div className="calendar-grid-scroll"><div className="calendar-grid">{hours.map(hour => <div key={hour} className="calendar-hour-row"><div className="calendar-hour-label">{clock(new Date(2000, 0, 1, hour))}</div>{days.map((day, index) => <div key={day} className="calendar-slot">{appointments.filter(item => localDate(scheduledDate(item)) === localDate(dateForDay(index)) && scheduledDate(item).getHours() === hour).map(item => <button className="calendar-booking" key={item.id} onClick={() => { setSelectedDay(index); setSelectedAppointment(item); }}><strong>{item.customer}</strong><span>{clock(scheduledDate(item))} · {item.service}</span><small>{item.tech}</small></button>)}<button className="calendar-add-slot" disabled={+dateForDay(index) + hour * 3600000 < Date.now()} aria-label={`حجز ${day} ${clock(new Date(2000, 0, 1, hour))}`} onClick={() => openBooking(dateForDay(index), hour)}><Plus size={13} /></button></div>)}</div>)}</div></div></div>
    <section className="calendar-agenda"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">حجوزات {days[selectedDay]} · {dateForDay(selectedDay).toLocaleDateString("ar-SA", { day: "numeric", month: "long", calendar: "gregory" })}</h2><button onClick={() => openBooking()} className="text-primary text-sm">إضافة حجز</button></div>{dailyAppointments.length ? dailyAppointments.map(item => <div className="calendar-agenda-item" key={item.id}><span><Clock3 size={16} />{clock(scheduledDate(item))}</span><button onClick={() => setSelectedAppointment(item)}><strong>{item.customer}</strong><small>{item.car} · {item.service} · {item.tech}</small></button><StatusBadge status={item.displayStatus ?? "قادم"} /><button disabled={pending} onClick={() => void cancel(item)} className="calendar-cancel">إلغاء الحجز</button></div>) : <div className="calendar-empty"><CalendarDays size={27} /><p>لا توجد حجوزات لهذا اليوم.</p><button onClick={() => openBooking()}>احجز أول موعد</button></div>}</section>
    <Modal open={showAdd} onClose={() => { if (!saving) setShowAdd(false); }} onEnterSubmit={saveAppointment} title="حجز موعد جديد" maxWidth="max-w-lg" actions={<><button onClick={() => setShowAdd(false)} disabled={pending || saving} className="workspace-secondary-action flex-1">إلغاء</button><button onClick={saveAppointment} disabled={pending || saving} className="workspace-primary-action flex-1">{saving || pending ? "جاري الحجز…" : "تأكيد الحجز"}</button></>}>
      <p className="text-xs text-muted-foreground">اختر العميل أولاً لتظهر سياراته. يمكن إسناد الفني لاحقاً.</p>
      <FormField label="العميل *" htmlFor="appt-customer"><select id="appt-customer" value={form.customer} onChange={event => setForm(previous => ({ ...previous, customer: event.target.value, car: "" }))} className={inputClass}><option value="">اختر العميل</option>{customers.map(item => <option key={item.id}>{item.name}</option>)}</select></FormField>
      <FormField label="السيارة *" htmlFor="appt-car"><select id="appt-car" disabled={!form.customer} value={form.car} onChange={event => setForm(previous => ({ ...previous, car: event.target.value }))} className={inputClass}><option value="">{form.customer ? "اختر سيارة العميل" : "اختر العميل أولاً"}</option>{vehicles.filter(item => item.owner === form.customer).map(item => <option key={item.plate} value={item.plate}>{item.make} {item.model} · {item.plate}</option>)}</select>{form.customer && !vehicles.some(item => item.owner === form.customer) && <p className="field-error">لا توجد سيارة لهذا العميل؛ سجّل سيارته من وحدة السيارات أولاً.</p>}</FormField>
      <FormField label="الخدمة *" htmlFor="appt-service"><select id="appt-service" value={form.service} onChange={event => setForm(previous => ({ ...previous, service: event.target.value }))} className={inputClass}><option value="">اختر الخدمة</option>{services.filter(item => item.status === "نشط").map(item => <option key={item.apiId ?? item.name}>{item.name}</option>)}</select></FormField>
      <FormField label="الفني (اختياري)" htmlFor="appt-tech"><select id="appt-tech" value={form.tech} onChange={event => setForm(previous => ({ ...previous, tech: event.target.value }))} className={inputClass}><option value="">إسناد لاحقاً</option>{technicians.map(item => <option key={item.id}>{item.name}</option>)}</select></FormField>
      <div className="grid grid-cols-2 gap-4"><FormField label="التاريخ *" htmlFor="appt-date"><input id="appt-date" type="date" min={localDate(new Date())} value={form.date} onChange={event => setForm(previous => ({ ...previous, date: event.target.value }))} className={inputClass} /></FormField><FormField label="الوقت *" htmlFor="appt-time"><input id="appt-time" type="time" value={form.time} onChange={event => setForm(previous => ({ ...previous, time: event.target.value }))} className={inputClass} /></FormField></div>
      <FormField label="المدة المتوقعة" htmlFor="appt-duration"><select id="appt-duration" value={form.duration} onChange={event => setForm(previous => ({ ...previous, duration: event.target.value }))} className={inputClass}>{[{ value: ".5", label: "نصف ساعة" }, { value: "1", label: "ساعة" }, { value: "2", label: "ساعتان" }, { value: "3", label: "٣ ساعات" }].map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></FormField>
      {formError && <div className="dialog-discard" role="alert"><p>{formError}</p>{form.tech && <button onClick={suggestTime} className="text-primary mt-2">اقتراح وقت متاح</button>}</div>}
    </Modal>
    <Modal open={Boolean(selectedAppointment)} onClose={() => setSelectedAppointment(null)} title="تفاصيل الحجز">{selectedAppointment && <div className="space-y-4"><h3 className="text-lg font-semibold">{selectedAppointment.customer}</h3><p>{selectedAppointment.car} · {selectedAppointment.service}</p><p className="text-sm text-muted-foreground">{scheduledDate(selectedAppointment).toLocaleDateString("ar-SA", { calendar: "gregory" })} · {clock(scheduledDate(selectedAppointment))} · {selectedAppointment.tech}</p><StatusBadge status={selectedAppointment.displayStatus ?? "قادم"} /><button onClick={() => void cancel(selectedAppointment)} className="calendar-cancel block">إلغاء هذا الحجز</button></div>}</Modal>
  </div>;
}
