import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import PageHeader from "./ui/PageHeader";
import TelegramIntegration from "./TelegramIntegration";

const roleColors: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  sky: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const allModules = [
  "لوحة التحكم", "العملاء", "السيارات", "قطع الغيار", "الخدمات",
  "المواعيد", "الفنيون", "الفحوصات", "عروض الأسعار",
  "أوامر التشغيل", "الفواتير", "المخازن", "التوريد", "الموظفون", "الصلاحيات",
];

const ROLE_COLORS = ["amber", "sky", "emerald", "rose", "violet"] as const;
const COLOR_LABEL: Record<string, string> = { amber: "ذهبي", sky: "أزرق", emerald: "أخضر", rose: "أحمر", violet: "بنفسجي" };

export default function Permissions() {
  const { systemUsers, roles, addSystemUser, addRole } = useAppData();
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "" });
  const [roleForm, setRoleForm] = useState({ name: "", color: "sky", permissions: [] as string[] });

  const saveUser = async () => {
    if (!form.name || !form.email || !form.role || form.password.length < 8) return;
    if ((await addSystemUser({ id: `USR-${String(systemUsers.length + 1).padStart(3, "0")}`, name: form.name, email: form.email, role: form.role, password: form.password, status: "نشط", lastLogin: "لم يسجل الدخول", avatar: form.name.trim().slice(0, 2) })) === false) return;
    setForm({ name: "", email: "", role: "", password: "" }); setShowAddUser(false);
  };

  const togglePermission = (m: string) =>
    setRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(m) ? f.permissions.filter((p) => p !== m) : [...f.permissions, m],
    }));

  const saveRole = async () => {
    if (!roleForm.name) return;
    if ((await addRole({ id: `ROLE-${Date.now()}`, name: roleForm.name, color: roleForm.color, users: 0, permissions: roleForm.permissions })) === false) return;
    setRoleForm({ name: "", color: "sky", permissions: [] });
    setShowAddRole(false);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <TelegramIntegration />
      <PageHeader
        title="إدارة الصلاحيات والمستخدمين"
        subtitle={`${toArabicNum(systemUsers.length)} مستخدم · ${toArabicNum(roles.length)} أدوار`}
        actions={
          <>
            <button
              onClick={() => setShowAddRole(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border"
            >
              + دور جديد
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
            >
              + إضافة مستخدم
            </button>
          </>
        }
      />

      {/* Roles Cards */}
      <div className="grid grid-cols-5 gap-3">
        {roles.map((r) => (
          <div key={r.id} className={`border rounded-xl p-4 ${roleColors[r.color] ?? roleColors.sky}`}>
            <div className="font-bold text-foreground text-lg font-mono">{toArabicNum(r.users)}</div>
            <div className="text-sm font-semibold mt-1">{r.name}</div>
            <div className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{r.permissions.join(" · ")}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border rounded-xl p-1 w-fit">
        {(["users", "roles"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "users" ? "المستخدمون" : "الأدوار والصلاحيات"}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["الرقم", "الاسم", "البريد", "الدور", "آخر دخول", "الحالة", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systemUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-sky-400 text-xs">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-foreground text-xs font-bold">{u.avatar}</div>
                      <div>
                        <div className="text-foreground font-medium">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono" dir="ltr">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${roleColors[roles.find((r) => r.name === u.role)?.color ?? "sky"] ?? roleColors.sky}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors" aria-label="خيارات">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-2 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`text-sm font-semibold px-2 py-0.5 rounded-full border w-fit mb-1 ${roleColors[r.color] ?? roleColors.sky}`}>{r.name}</div>
                  <div className="text-xs text-muted-foreground">{toArabicNum(r.users)} مستخدمون</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allModules.map((m) => (
                  <span
                    key={m}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                      r.permissions.includes("كل الصلاحيات") || r.permissions.some((p) => p.startsWith(m.split(" ")[0]))
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Role Modal */}
      <Modal
        open={showAddRole}
        onClose={() => setShowAddRole(false)}
        title="إضافة دور جديد"
        actions={
          <>
            <button onClick={() => setShowAddRole(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveRole} disabled={!roleForm.name} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إضافة</button>
          </>
        }
      >
        <FormField label="اسم الدور" htmlFor="role-name">
          <input id="role-name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="مثال: مشرف المخزن" className={inputClass} />
        </FormField>
        <FormField label="اللون" htmlFor="role-color">
          <div className="flex gap-2 pt-1">
            {ROLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setRoleForm({ ...roleForm, color: c })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${roleColors[c]} ${roleForm.color === c ? "ring-2 ring-offset-1 ring-primary" : "opacity-60 hover:opacity-100"}`}
              >
                {COLOR_LABEL[c]}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="الصلاحيات" htmlFor="role-perms">
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setRoleForm((f) => ({ ...f, permissions: f.permissions.length === allModules.length ? [] : [...allModules] }))}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${roleForm.permissions.length === allModules.length ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border hover:border-primary/30"}`}
            >
              الكل
            </button>
            {allModules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => togglePermission(m)}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${roleForm.permissions.includes(m) ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-secondary text-muted-foreground border-border hover:border-primary/30"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </FormField>
      </Modal>

      {/* Add User Modal */}
      <Modal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="إضافة مستخدم جديد"
        actions={
          <>
            <button onClick={() => setShowAddUser(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveUser} disabled={!form.name || !form.email || !form.role || form.password.length < 8} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إضافة</button>
          </>
        }
      >
        <FormField label="الاسم الكامل" htmlFor="usr-name">
          <input id="usr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم" className={inputClass} />
        </FormField>
        <FormField label="البريد الإلكتروني" htmlFor="usr-email">
          <input id="usr-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="user@autoserve.sa" className={inputClass} dir="ltr" />
        </FormField>
        <FormField label="الدور" htmlFor="usr-role">
          <select id="usr-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
            <option value="">اختر الدور</option>
            {roles.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
        </FormField>
        <FormField label="كلمة مرور أولية (٨ أحرف على الأقل)" htmlFor="usr-password"><input id="usr-password" type="password" autoComplete="new-password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={inputClass} /></FormField>
        <FormField label="كلمة المرور" htmlFor="usr-pass">
          <input id="usr-pass" type="password" placeholder="••••••••" className={inputClass} dir="ltr" />
        </FormField>
      </Modal>
    </div>
  );
}
