import { useState } from "react";
import type { PageKey } from "../App";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum, partStatus } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import FilterPills from "./ui/FilterPills";
import SearchBox from "./ui/SearchBox";
import PageHeader from "./ui/PageHeader";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";

const categories = ["الكل", "فلاتر", "فرامل", "زيوت", "كهرباء", "تعليق", "محرك", "إشعال"];

interface Props {
  onNavigate: (page: PageKey) => void;
}

export default function SpareParts({ onNavigate }: Props) {
  const { parts, addPart } = useAppData();
  const [cat, setCat] = useState("الكل");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", category: "", brand: "", stock: "", minStock: "", price: "" });
  const savePart = async () => {
    if (Object.values(form).some((value) => !value)) return;
    if (parts.some((part) => part.sku === form.sku)) return;
    if ((await addPart({ ...form, stock: Number(form.stock), minStock: Number(form.minStock), price: Number(form.price), compatible: [] })) === false) return;
    setForm({ sku: "", name: "", category: "", brand: "", stock: "", minStock: "", price: "" }); setShowAdd(false);
  };

  const filtered = parts.filter(
    (p) =>
      (cat === "الكل" || p.category === cat) &&
      (p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const lowStockParts = parts.filter((p) => p.stock === 0 || p.stock < p.minStock);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="قطع الغيار"
        subtitle={`${toArabicNum(parts.length)} قطعة مسجلة`}
        actions={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
            + إضافة قطعة
          </button>
        }
      />

      {/* Alert */}
      {lowStockParts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-rose-500/35 animate-ping" />
            <span className="relative text-rose-400 text-xl leading-none" aria-hidden="true">⚠️</span>
          </span>
          <div>
            <div className="text-rose-400 font-semibold text-sm">تنبيه مخزون</div>
            <div className="text-rose-400/70 text-xs">{toArabicNum(lowStockParts.length)} قطع وصلت للحد الأدنى أو نفدت — يُنصح بإصدار طلب شراء</div>
          </div>
          <button
            onClick={() => onNavigate("purchase-orders")}
            className="mr-auto px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs hover:bg-rose-500/30 transition-colors"
          >
            طلب شراء
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي الأصناف", value: toArabicNum(parts.length), color: "text-foreground" },
          { label: "متوفر", value: toArabicNum(parts.filter((p) => p.stock >= p.minStock && p.stock > 0).length), color: "text-emerald-400" },
          { label: "منخفض المخزون", value: toArabicNum(parts.filter((p) => p.stock > 0 && p.stock < p.minStock).length), color: "text-primary" },
          { label: "نفد المخزون", value: toArabicNum(parts.filter((p) => p.stock === 0).length), color: "text-rose-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <FilterPills options={categories} selected={cat} onChange={setCat} />

      <SearchBox value={search} onChange={setSearch} placeholder="البحث بالاسم أو رمز القطعة..." id="parts-search" />

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["الرمز", "الاسم", "الفئة", "الماركة", "متاح", "محجوز", "المخزون", "الحد الأدنى", "التكلفة المتوسطة", "السعر", "الحالة", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = partStatus(p.stock, p.minStock);
              return (
                <tr key={p.sku} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.barcode && <span className="text-[10px] font-mono text-muted-foreground/60">{p.barcode}</span>}
                      {p.oem && <span className="text-[10px] font-mono text-sky-400/70">OEM: {p.oem}</span>}
                    </div>
                    {p.alternatives && p.alternatives.length > 0 && (
                      <div className="text-[10px] text-muted-foreground/50 mt-0.5">بديل: {p.alternatives.join("، ")}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.brand}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 text-xs">{p.available !== undefined ? toArabicNum(p.available) : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-amber-400 text-xs">{p.allocated !== undefined ? toArabicNum(p.allocated) : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(p.stock)}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{toArabicNum(p.minStock)}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{p.averageCost !== undefined ? `${toArabicNum(p.averageCost)} ر.س` : "—"}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(p.price)} ر.س</td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors" aria-label="خيارات">⋯</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة قطعة غيار" maxWidth="max-w-lg" actions={<><button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button><button onClick={savePart} disabled={Object.values(form).some((value) => !value)} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">حفظ القطعة</button></>}>
        <div className="grid grid-cols-2 gap-3"><FormField label="رمز القطعة" htmlFor="part-sku"><input id="part-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} /></FormField><FormField label="اسم القطعة" htmlFor="part-name"><input id="part-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></FormField></div>
        <div className="grid grid-cols-2 gap-3"><FormField label="الفئة" htmlFor="part-category"><select id="part-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}><option value="">اختر الفئة</option>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></FormField><FormField label="الماركة" htmlFor="part-brand"><input id="part-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} /></FormField></div>
        <div className="grid grid-cols-3 gap-3"><FormField label="الرصيد" htmlFor="part-stock"><input id="part-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} /></FormField><FormField label="الحد الأدنى" htmlFor="part-min"><input id="part-min" type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className={inputClass} /></FormField><FormField label="السعر" htmlFor="part-price"><input id="part-price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} /></FormField></div>
      </Modal>
    </div>
  );
}
