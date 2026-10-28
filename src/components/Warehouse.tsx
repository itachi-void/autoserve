import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import PageHeader from "./ui/PageHeader";
import RecordFormModal from "./ui/RecordFormModal";
import type { PageKey } from "../App";

export default function Warehouse({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { warehouseTransactions, suppliers, purchaseOrders, parts, addSupplier, adjustStock } = useAppData();
  const [showSupplier, setShowSupplier] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [tab, setTab] = useState<"transactions" | "suppliers">("transactions");

  const inbound = warehouseTransactions.filter((t) => t.type === "وارد").reduce((s, t) => s + t.cost, 0);
  const outbound = warehouseTransactions.filter((t) => t.type === "صادر").reduce((s, t) => s + t.cost, 0);
  const pendingOrders = purchaseOrders.filter((p) => p.status === "معلق" || p.status === "في الطريق").length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <RecordFormModal open={showSupplier} onClose={() => setShowSupplier(false)} title="مورد جديد" fields={[{ name: "name", label: "اسم المورد" }, { name: "code", label: "رمز المورد" }, { name: "category", label: "الفئة" }, { name: "contact", label: "مسؤول التواصل" }, { name: "phone", label: "الهاتف" }]} onSave={values => addSupplier({ name: values.name, code: values.code, category: values.category, contact: values.contact, phone: values.phone, orders: 0, lastOrder: "—", status: "نشط" })} />
      <RecordFormModal open={showStock} onClose={() => setShowStock(false)} title="تسجيل حركة مخزون" fields={[{ name: "sku", label: "رمز القطعة", options: parts.map(part => part.sku) }, { name: "type", label: "نوع الحركة", options: ["وارد", "صادر"] }, { name: "quantity", label: "الكمية", type: "number" }, { name: "cost", label: "تكلفة الوحدة", type: "number", defaultValue: "0" }]} onSave={values => adjustStock(values.sku, Number(values.quantity), values.type === "صادر" ? "صادر" : "وارد", Number(values.cost))} />
      <PageHeader
        title="المخازن والتوريد"
        subtitle="حركة المخزون وإدارة الموردين"
        actions={
          <>
            <button onClick={() => setShowStock(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm">+ حركة مخزون</button>
            <button onClick={() => setShowSupplier(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              + مورد جديد
            </button>
            <button onClick={() => onNavigate("purchase-orders")} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
              + أمر شراء
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "قيمة المخزون", value: `${toArabicNum(parts.reduce((sum, part) => sum + part.stock * (part.averageCost ?? part.price), 0))} ر.س`, icon: "📦", color: "text-foreground" },
          { label: "وارد هذا الشهر", value: `${toArabicNum(inbound)} ر.س`, icon: "📥", color: "text-emerald-400" },
          { label: "صادر هذا الشهر", value: `${toArabicNum(outbound)} ر.س`, icon: "📤", color: "text-sky-400" },
          { label: "أوامر شراء معلقة", value: `${toArabicNum(pendingOrders)} أوامر`, icon: "🔔", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border rounded-xl p-1 w-fit">
        {(["transactions", "suppliers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "transactions" ? "حركة المخزون" : "الموردون"}
          </button>
        ))}
      </div>

      {tab === "transactions" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["رقم الحركة", "النوع", "القطعة", "الكمية", "الوحدة", "المرجع", "نوع المرجع", "بواسطة", "التاريخ", "التكلفة"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {warehouseTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{t.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${t.type === "وارد" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{t.part}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(t.qty)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.unit}</td>
                  <td className="px-4 py-3 font-mono text-sky-400 text-xs">{t.ref}</td>
                  <td className="px-4 py-3 text-xs">{t.refType ? <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 font-medium">{t.refType}</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.createdBy ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.date}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(t.cost)} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "suppliers" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["الكود", "المورد", "الفئة", "جهة التواصل", "الهاتف", "الطلبات", "آخر طلب", "الحالة", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.code} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{s.code}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.category}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.contact}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{s.phone}</td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicNum(s.orders)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.lastOrder}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors" aria-label="خيارات">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
