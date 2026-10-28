import { useState, useEffect } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import PageHeader from "./ui/PageHeader";
import RecordFormModal from "./ui/RecordFormModal";
import type { Employee } from "../data/types";

const deptColors: Record<string, string> = {
  sky: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
};

const deptText: Record<string, string> = {
  sky: "text-sky-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
};

const colorOptions = [
  { value: "sky", label: "أزرق" },
  { value: "amber", label: "ذهبي" },
  { value: "emerald", label: "أخضر" },
  { value: "rose", label: "وردي" },
];

function DetailRow({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-foreground text-left ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function EmployeeDrawer({ employee, onClose, onStatusChange }: { employee: Employee; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const avatarColors: Record<string, string> = {
    نشط: "from-emerald-600 to-emerald-500",
    مشغول: "from-amber-600 to-amber-500",
    "غير نشط": "from-slate-600 to-slate-500",
  };

  const salaryFormatted = employee.basicSalary
    ? `${employee.basicSalary.toLocaleString("ar-SA")} ر.س`
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer — slides from right in RTL */}
      <div className="fixed top-0 right-0 h-full z-50 w-80 bg-card border-r border-border shadow-2xl flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground text-sm">بيانات الموظف</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Avatar + name block */}
          <div className="px-5 py-6 border-b border-border/60">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[employee.status] ?? "from-slate-600 to-slate-500"} flex items-center justify-center text-white text-xl font-bold mb-3`}>
              {employee.name[0]}
            </div>
            <div className="text-base font-semibold text-foreground">{employee.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{employee.role} · {employee.dept}</div>
            <div className="mt-3">
              <StatusBadge status={employee.status} />
            </div>
            {employee.statusReason && (
              <div className="mt-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                {employee.statusReason}
              </div>
            )}
          </div>

          {/* API fields */}
          <div className="px-5 py-4 border-b border-border/60">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">بيانات الموظف</div>
            <DetailRow label="الرقم" value={employee.id} mono />
            <DetailRow label="الهاتف" value={employee.phone} mono />
            <DetailRow label="البريد الإلكتروني" value={employee.email} mono />
            <DetailRow label="العنوان" value={employee.address} />
            <DetailRow label="الراتب الأساسي" value={salaryFormatted} mono />
            <DetailRow label="تاريخ الانضمام" value={employee.since} />
          </div>

          {/* Design-only fields */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              ملخص النشاط
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-muted-foreground">المهام النشطة</span>
              <span className="text-xs font-mono text-foreground">
                {employee.tasks > 0 ? toArabicNum(employee.tasks) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
          <div className="text-[10px] text-muted-foreground mb-1">تغيير الحالة</div>
          <div className="flex gap-2">
            {["نشط", "مشغول", "غير نشط"].map((s) => (
              <button
                key={s}
                disabled={employee.status === s}
                onClick={() => onStatusChange(employee.id, s)}
                className="flex-1 py-1.5 rounded-lg text-xs border transition-all disabled:opacity-40 disabled:cursor-default border-border text-muted-foreground hover:bg-secondary enabled:hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Employees() {
  const { employees, departments, addDepartment, addEmployee, setEmployees } = useAppData();
  const [showEmployee, setShowEmployee] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", head: "", color: "sky" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClick() { setOpenMenuId(null); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  // Keep drawer in sync when employee data changes (e.g. status update)
  useEffect(() => {
    if (!selectedEmployee) return;
    const updated = employees.find((e) => e.id === selectedEmployee.id);
    if (updated) setSelectedEmployee(updated);
    else setSelectedEmployee(null);
  }, [employees]);

  async function handleAddDept() {
    if (!deptForm.name.trim()) return;
    if ((await addDepartment({
      name: deptForm.name.trim(),
      head: deptForm.head.trim() || "—",
      count: 0,
      color: deptForm.color,
    })) === false) return;
    setDeptForm({ name: "", head: "", color: "sky" });
    setShowDeptDialog(false);
  }

  async function handleChangeStatus(id: string, status: string) {
    if ((await setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status } : e))) === false) return;
    setOpenMenuId(null);
  }

  async function handleDelete(id: string) {
    if ((await setEmployees((prev) => prev.filter((e) => e.id !== id))) === false) return;
    setOpenMenuId(null);
    if (selectedEmployee?.id === id) setSelectedEmployee(null);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <RecordFormModal open={showEmployee} onClose={() => setShowEmployee(false)} title="موظف جديد" fields={[{ name: "name", label: "الاسم" }, { name: "role", label: "المسمى الوظيفي" }, { name: "dept", label: "القسم", options: departments.map(item => item.name) }, { name: "phone", label: "الهاتف" }, { name: "email", label: "البريد", type: "email", required: false }, { name: "salary", label: "الراتب الأساسي", type: "number", defaultValue: "0" }]} onSave={values => addEmployee({ id: crypto.randomUUID(), name: values.name, role: values.role, dept: values.dept, phone: values.phone, email: values.email, basicSalary: Number(values.salary), status: "نشط", since: new Date().toLocaleDateString("ar-SA"), tasks: 0 })} />
      <PageHeader
        title="الموظفون والأقسام"
        subtitle={`${toArabicNum(employees.length)} موظف · ${toArabicNum(departments.length)} أقسام`}
        actions={
          <>
            <button
              onClick={() => setShowDeptDialog(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border"
            >
              + قسم جديد
            </button>
            <button onClick={() => setShowEmployee(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
              + موظف جديد
            </button>
          </>
        }
      />

      {/* Departments */}
      <div className="grid grid-cols-4 gap-4">
        {departments.map((d) => (
          <div key={d.name} className={`bg-gradient-to-br ${deptColors[d.color] ?? "from-slate-500/20 to-slate-600/5 border-slate-500/30"} border rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all`}>
            <div className={`text-xl font-bold font-mono ${deptText[d.color] ?? "text-slate-400"}`}>{toArabicNum(d.count)}</div>
            <div className="text-sm font-semibold text-foreground mt-1">{d.name}</div>
            {d.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{d.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              مدير: {d.head}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">جميع الموظفين</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الرقم</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الاسم</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الدور</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">القسم</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الهاتف</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">منذ</th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5">
                  المهام النشطة
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الحالة</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr
                key={e.id}
                className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer"
                onClick={() => setSelectedEmployee(e)}
              >
                <td className="px-4 py-3 font-mono text-sky-400 text-xs">{e.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-foreground text-xs font-bold">
                      {e.name[0]}
                    </div>
                    <div>
                      <div className="text-foreground font-medium">{e.name}</div>
                      {e.email && <div className="text-muted-foreground text-[10px] font-mono">{e.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.role}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.dept}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{e.phone}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.since}</td>
                <td className="px-4 py-3 text-center">
                  {e.tasks > 0 ? (
                    <span className="bg-sky-500/15 text-sky-400 text-xs px-2 py-0.5 rounded-full font-mono">{toArabicNum(e.tasks)}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 relative" onClick={(ev) => ev.stopPropagation()}>
                  <button
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    aria-label="خيارات"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setOpenMenuId(openMenuId === e.id ? null : e.id);
                    }}
                  >
                    ⋯
                  </button>
                  {openMenuId === e.id && (
                    <div
                      className="absolute left-0 top-full z-50 mt-1 w-44 bg-card border border-border rounded-xl shadow-xl py-1 text-xs"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      {e.status !== "نشط" && (
                        <button className="w-full text-right px-4 py-2 hover:bg-secondary/60 transition-colors text-foreground" onClick={() => handleChangeStatus(e.id, "نشط")}>تعيين نشط</button>
                      )}
                      {e.status !== "مشغول" && (
                        <button className="w-full text-right px-4 py-2 hover:bg-secondary/60 transition-colors text-foreground" onClick={() => handleChangeStatus(e.id, "مشغول")}>تعيين مشغول</button>
                      )}
                      {e.status !== "غير نشط" && (
                        <button className="w-full text-right px-4 py-2 hover:bg-secondary/60 transition-colors text-foreground" onClick={() => handleChangeStatus(e.id, "غير نشط")}>تعيين غير نشط</button>
                      )}
                      <div className="border-t border-border/50 my-1" />
                      <button className="w-full text-right px-4 py-2 hover:bg-rose-500/10 transition-colors text-rose-400" onClick={() => handleDelete(e.id)}>حذف الموظف</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee detail drawer */}
      {selectedEmployee && (
        <EmployeeDrawer
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onStatusChange={handleChangeStatus}
        />
      )}

      {/* Add Department Dialog */}
      {showDeptDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeptDialog(false)}>
          <div className="bg-card border border-border rounded-2xl w-96 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} dir="rtl">
            <h3 className="text-base font-semibold text-foreground mb-4">إضافة قسم جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">اسم القسم</label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: خدمة العملاء"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <span className="inline-flex items-center gap-1.5">المدير </span>
                </label>
                <input
                  type="text"
                  value={deptForm.head}
                  onChange={(e) => setDeptForm((p) => ({ ...p, head: e.target.value }))}
                  placeholder="اسم مدير القسم"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  <span className="inline-flex items-center gap-1.5">اللون </span>
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setDeptForm((p) => ({ ...p, color: c.value }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${deptForm.color === c.value ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeptDialog(false)} className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm border border-border hover:opacity-80 transition-colors">إلغاء</button>
              <button onClick={handleAddDept} disabled={!deptForm.name.trim()} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
