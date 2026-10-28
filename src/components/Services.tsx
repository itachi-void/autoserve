import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import PageHeader from "./ui/PageHeader";
import RecordFormModal from "./ui/RecordFormModal";

const catColors: Record<string, string> = {
  sky: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export default function Services() {
  const { services, serviceCategories, addService, addServiceCategory } = useAppData();
  const [showCategory, setShowCategory] = useState(false);
  const [selectedCat, setSelectedCat] = useState("الكل");
  const [showAddService, setShowAddService] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", basePrice: "", extraPrice: "", duration: "" });
  const saveService = async () => {
    if (!form.name || !form.category || !form.basePrice || !form.duration) return;
    if ((await addService({ id: `SVC-${String(services.length + 1).padStart(3, "0")}`, name: form.name, category: form.category, basePrice: Number(form.basePrice), extraPrice: form.extraPrice ? Number(form.extraPrice) : null, duration: form.duration, status: "نشط" })) === false) return;
    setForm({ name: "", category: "", basePrice: "", extraPrice: "", duration: "" }); setShowAddService(false);
  };

  const filtered = selectedCat === "الكل" ? services : services.filter((s) => s.category === selectedCat);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <RecordFormModal open={showCategory} onClose={() => setShowCategory(false)} title="تصنيف خدمات جديد" fields={[{ name: "name", label: "اسم التصنيف" }, { name: "description", label: "الوصف", required: false }]} onSave={values => addServiceCategory({ id: crypto.randomUUID(), name: values.name, description: values.description, color: "sky", icon: "wrench" })} />
      <PageHeader
        title="إدارة الخدمات"
        subtitle={`${toArabicNum(services.length)} خدمة · ${toArabicNum(serviceCategories.length)} تصنيفات`}
        actions={
          <>
            <button onClick={() => setShowCategory(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              + تصنيف جديد
            </button>
            <button
              onClick={() => setShowAddService(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
            >
              + خدمة جديدة
            </button>
          </>
        }
      />

      {/* Category Cards */}
      <div className="grid grid-cols-6 gap-3">
        {serviceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(selectedCat === c.name ? "الكل" : c.name)}
            className={`border rounded-xl p-4 text-right transition-all hover:brightness-110 ${
              selectedCat === c.name ? catColors[c.color] : "bg-card border-border hover:border-primary/40"
            }`}
          >
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-xs font-semibold text-foreground leading-tight">{c.name}</div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              {toArabicNum(services.filter((s) => s.category === c.name).length)} خدمات
            </div>
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {selectedCat === "الكل" ? "جميع الخدمات" : selectedCat}
            <span className="text-muted-foreground text-sm font-normal mr-2">({toArabicNum(filtered.length)})</span>
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["الكود", "اسم الخدمة", "التصنيف", "نموذج التسعير", "الكشك", "السعر الأساسي", "سعر إضافي", "المدة", "الحالة", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const cat = serviceCategories.find((c) => c.name === s.category);
              return (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{s.name}</div>
                    {s.description && <div className="text-[10px] text-muted-foreground/70 mt-0.5 leading-snug max-w-48 line-clamp-1">{s.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {cat && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${catColors[cat.color]}`}>
                        {cat.icon} {s.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.pricingModel
                      ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 font-medium">{s.pricingModel}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.requiredBay ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(s.basePrice)} ر.س</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.extraPrice === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="text-sky-400">+{toArabicNum(s.extraPrice)} ر.س</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{s.duration}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="text-[10px] px-2 py-1 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition-colors">تعديل</button>
                      <button className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors">سعر إضافي</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        title="إضافة خدمة جديدة"
        actions={
          <>
            <button onClick={() => setShowAddService(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveService} disabled={!form.name || !form.category || !form.basePrice || !form.duration} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">حفظ</button>
          </>
        }
      >
        <FormField label="اسم الخدمة" htmlFor="svc-name">
          <input id="svc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: تغيير زيت ناقل الحركة" className={inputClass} />
        </FormField>
        <FormField label="التصنيف" htmlFor="svc-cat">
          <select id="svc-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
            <option value="">اختر التصنيف</option>
            {serviceCategories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="السعر الأساسي (ر.س)" htmlFor="svc-price">
            <input id="svc-price" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="٠" type="number" className={`${inputClass} font-mono`} />
          </FormField>
          <FormField label="سعر إضافي (اختياري)" htmlFor="svc-extra">
            <input id="svc-extra" value={form.extraPrice} onChange={(e) => setForm({ ...form, extraPrice: e.target.value })} placeholder="٠" type="number" className={`${inputClass} font-mono`} />
          </FormField>
        </div>
        <FormField label="المدة التقديرية" htmlFor="svc-dur">
          <input id="svc-dur" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="مثال: ٦٠ دقيقة" className={inputClass} />
        </FormField>
      </Modal>
    </div>
  );
}
