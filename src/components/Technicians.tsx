import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import ProgressBar from "./ui/ProgressBar";
import PageHeader from "./ui/PageHeader";
import { useToast } from "../data/ToastContext";
import { useConfirm } from "../data/ConfirmContext";

const dotColor: Record<string, string> = {
  "نشط": "bg-emerald-500",
  "مشغول": "bg-amber-500",
  "إجازة": "bg-slate-500",
  "موقوف": "bg-rose-500",
};

export default function Technicians() {
  const { technicians, workOrders, addTechnician, assignWorkOrder, setWorkOrders } = useAppData();
  const toast = useToast();
  const confirm = useConfirm();
  const [selected, setSelected] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [assign, setAssign] = useState({ tech: "", order: "" });
  const [form, setForm] = useState({ name: "", specialty: "", phone: "" });
  const saveTechnician = async () => {
    if (!form.name || !form.specialty || !form.phone) return;
    if ((await addTechnician({ id: `TECH-${String(technicians.length + 1).padStart(3, "0")}`, ...form, status: "نشط", tasks: 0, maxTasks: 4, rating: 0, completedJobs: 0, joinDate: "٢٧ أغسطس ٢٠٢٦", currentTasks: [] })) === false) return;
    toast(`تم تسجيل الفني ${form.name} بنجاح`);
    setShowAdd(false);
  };
  const saveAssignment = async () => {
    if (!assign.tech || !assign.order) return;
    if ((await assignWorkOrder(assign.order, assign.tech)) === false) return;
    toast("تم إسناد المهمة بنجاح");
    setShowAssign(false);
  };
  const handleUnassign = async (techName: string) => {
    const ok = await confirm({ title: "إلغاء إسناد", message: `هل تريد إلغاء إسناد جميع مهام ${techName}؟`, confirmLabel: "إلغاء الإسناد", danger: true });
    if (ok && (await setWorkOrders(previous => previous.map(order => order.tech === techName && !["مكتمل", "ملغي"].includes(order.status) ? { ...order, tech: "غير مسند" } : order))) !== false) toast("تم إلغاء الإسناد", "warning");
  };

  const selectedTech = technicians.find((t) => t.id === selected);
  const availableCount = technicians.filter((t) => t.status === "نشط").length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="إدارة الفنيين"
        subtitle={`${toArabicNum(technicians.length)} فنيين · ${toArabicNum(availableCount)} متاحون`}
        actions={
          <>
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              + تسجيل فني
            </button>
            <button
              onClick={() => setShowAssign(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
            >
              + إسناد مهمة
            </button>
          </>
        }
      />

      {/* Load Overview */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4">نظرة عامة على الحمل</h2>
        <div className="grid grid-cols-5 gap-4">
          {technicians.map((t) => {
            const pct = (t.tasks / t.maxTasks) * 100;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(selected === t.id ? null : t.id)}
                className={`text-right p-3 rounded-xl border transition-all ${
                  selected === t.id ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex-shrink-0 w-2 h-2">
                    {t.status === "نشط" && <span className="absolute inset-0 rounded-full bg-emerald-400/55 animate-ping" />}
                    <span className={`relative block w-2 h-2 rounded-full ${dotColor[t.status] ?? "bg-slate-500"}`} />
                  </span>
                  <span className="text-xs text-foreground font-medium truncate">{t.name.split(" ")[0]}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2 truncate">{t.specialty}</div>
                <ProgressBar value={pct} height="h-1.5" />
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{toArabicNum(t.tasks)}/{toArabicNum(t.maxTasks)} مهام</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        {technicians.map((t) => {
          const pct = (t.tasks / t.maxTasks) * 100;
          return (
            <div
              key={t.id}
              onClick={() => setSelected(selected === t.id ? null : t.id)}
              className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all ${
                selected === t.id ? "border-primary/40" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-foreground font-bold text-lg">
                      {t.name[0]}
                    </div>
                    <span className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-card ${dotColor[t.status] ?? "bg-slate-500"}`}>
                      {t.status === "نشط" && <span className="absolute -inset-0.5 rounded-full bg-emerald-400/40 animate-ping" />}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.specialty}</div>
                    {t.phone && <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{t.phone}</div>}
                    {t.employeeId && <div className="text-[10px] font-mono text-primary/60 mt-0.5">{t.employeeId}</div>}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                {t.efficiency !== undefined ? (
                  <div className="bg-secondary rounded-lg p-2">
                    <div className="text-sm font-bold font-mono text-sky-400">{toArabicNum(t.efficiency)}٪</div>
                    <div className="text-[10px] text-muted-foreground">الكفاءة</div>
                  </div>
                ) : (
                  <div className="bg-secondary rounded-lg p-2">
                    <div className="text-sm font-bold font-mono text-foreground">{t.rating}</div>
                    <div className="text-[10px] text-muted-foreground">التقييم</div>
                  </div>
                )}
                <div className="bg-secondary rounded-lg p-2">
                  <div className="text-sm font-bold font-mono text-foreground">{toArabicNum(t.completedJobs)}</div>
                  <div className="text-[10px] text-muted-foreground">مكتملة</div>
                </div>
                <div className="bg-secondary rounded-lg p-2">
                  <div className="text-sm font-bold font-mono text-foreground">{toArabicNum(t.tasks)}</div>
                  <div className="text-[10px] text-muted-foreground">حالية</div>
                </div>
              </div>

              <div className="mb-1 flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>الحمل</span><span>{toArabicNum(t.tasks)}/{toArabicNum(t.maxTasks)}</span>
              </div>
              <ProgressBar value={pct} height="h-1.5" />

              {selected === t.id && (
                <div className="space-y-2 pt-3 mt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground font-mono mb-2">المهام الحالية:</div>
                  {t.currentTasks.map((task) => (
                    <div key={task.id} className="bg-secondary rounded-lg p-2.5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-mono text-primary">{task.id}</span>
                        <span className="text-muted-foreground">{task.car}</span>
                      </div>
                      <div className="text-xs text-foreground mb-1.5">{task.service}</div>
                      <ProgressBar
                        value={task.progress}
                        colorClass={task.progress === 100 ? "bg-emerald-500" : "bg-sky-500"}
                        height="h-1"
                      />
                    </div>
                  ))}
                  {t.timeLogs && t.timeLogs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">سجل الحضور:</div>
                      {t.timeLogs.map((log, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                          <span className="font-mono text-primary/80">{log.task}</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{log.clockIn}</span>
                            {log.clockOut && <><span>—</span><span>{log.clockOut}</span></>}
                            <StatusBadge status={log.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-border hover:border-primary/20">
                  إيقاف مؤقت
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleUnassign(t.name); }} className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors border border-border hover:border-rose-500/20">
                  إلغاء إسناد
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      <Modal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="إسناد مهمة لفني"
        actions={
          <>
            <button onClick={() => setShowAssign(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveAssignment} disabled={!assign.tech || !assign.order} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إسناد</button>
          </>
        }
      >
        <FormField label="اختر الفني" htmlFor="assign-tech">
          <select id="assign-tech" value={assign.tech} onChange={(e) => setAssign({ ...assign, tech: e.target.value })} className={inputClass}>
            <option value="">اختر الفني</option>
            {technicians.filter((t) => t.status !== "موقوف").map((t) => (
              <option key={t.id}>{t.name} — {t.specialty} ({t.tasks}/{t.maxTasks})</option>
            ))}
          </select>
        </FormField>
        <FormField label="أمر التشغيل" htmlFor="assign-order">
          <select id="assign-order" value={assign.order} onChange={(e) => setAssign({ ...assign, order: e.target.value })} className={inputClass}>
            <option value="">اختر أمر التشغيل</option>
            {workOrders.filter((order) => order.status !== "مكتمل").map((order) => <option key={order.id} value={order.id}>{order.id} — {order.car}</option>)}
          </select>
        </FormField>
        <FormField label="ملاحظات" htmlFor="assign-notes">
          <textarea
            id="assign-notes"
            rows={3}
            placeholder="تعليمات إضافية للفني..."
            className={`${inputClass} resize-none`}
          />
        </FormField>
      </Modal>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="تسجيل فني جديد" actions={<><button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button><button onClick={saveTechnician} disabled={!form.name || !form.specialty || !form.phone} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">تسجيل</button></>}>
        <FormField label="الاسم" htmlFor="tech-name"><input id="tech-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></FormField><FormField label="التخصص" htmlFor="tech-specialty"><input id="tech-specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className={inputClass} /></FormField><FormField label="الهاتف" htmlFor="tech-phone"><input id="tech-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></FormField>
      </Modal>
    </div>
  );
}
