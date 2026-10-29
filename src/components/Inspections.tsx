import { useState } from "react";
import { Camera, Eye } from "lucide-react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import PageHeader from "./ui/PageHeader";
import RecordFormModal from "./ui/RecordFormModal";
import DamagePhotoModal, { type DamageItem } from "./ui/DamagePhotoModal";

export default function Inspections() {
  const { inspectionTemplates, customInspections, technicians, vehicles, addCustomInspection, addInspectionTemplate, updateInspection } = useAppData();
  const [showTemplate, setShowTemplate] = useState(false);
  const [tab, setTab] = useState<"templates" | "custom">("templates");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [damageModalInspection, setDamageModalInspection] = useState<typeof customInspections[0] | null>(null);
  const [form, setForm] = useState({ name: "", car: "", tech: "", template: "" });
  const saveInspection = async () => {
    if (!form.name || !form.car || !form.tech || !form.template) return;
    const template = inspectionTemplates.find((item) => item.name === form.template);
    if ((await addCustomInspection({ id: `INSP-${String(customInspections.length + 1).padStart(3, "0")}`, name: form.name, templateId: template?.apiId, car: form.car, tech: form.tech, date: "٢٧ أغسطس ٢٠٢٦", points: template?.points ?? 0, result: "بانتظار الفحص", status: "مجدول", damages: [] })) === false) return;
    setForm({ name: "", car: "", tech: "", template: "" }); setShowCreate(false); setTab("custom");
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6" dir="rtl">
      <RecordFormModal open={showTemplate} onClose={() => setShowTemplate(false)} title="قالب فحص جديد" fields={[{ name: "name", label: "اسم القالب" }, { name: "type", label: "النوع", defaultValue: "شامل" }, { name: "section", label: "اسم القسم" }, { name: "items", label: "نقاط الفحص (نقطة في كل سطر)", type: "textarea" }]} onSave={values => { const items = values.items.split(/\n|،|,/).map(item => item.trim()).filter(Boolean); return addInspectionTemplate({ id: crypto.randomUUID(), name: values.name, type: values.type, points: items.length, usedCount: 0, sections: [{ name: values.section, items }] }); }} />
      <PageHeader
        title="إدارة الفحوصات"
        subtitle={`${toArabicNum(inspectionTemplates.length)} قوالب ثابتة · ${toArabicNum(customInspections.length)} فحوصات مخصصة`}
        actions={
          <>
            <button onClick={() => setShowTemplate(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              + قالب جديد
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
            >
              + فحص مخصص
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border rounded-xl p-1 w-fit">
        {(["templates", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "templates" ? "📋 القوالب الثابتة" : "🔍 الفحوصات المخصصة"}
          </button>
        ))}
      </div>

      {tab === "templates" && (
        <div className="space-y-4">
          {inspectionTemplates.map((tmpl) => (
            <div key={tmpl.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === tmpl.id ? null : tmpl.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-primary text-xs">{tmpl.id}</span>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{tmpl.name}</div>
                    <div className="text-xs text-muted-foreground">{toArabicNum(tmpl.points)} نقطة فحص · استُخدم {toArabicNum(tmpl.usedCount)} مرة</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">{tmpl.type}</span>
                  <span className="text-muted-foreground text-sm" aria-hidden="true">{expanded === tmpl.id ? "▲" : "▼"}</span>
                </div>
              </button>
              {expanded === tmpl.id && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {tmpl.sections.map((sec) => (
                      <div key={sec.name} className="bg-secondary rounded-xl p-4">
                        <div className="text-sm font-semibold text-foreground mb-3">{sec.name}</div>
                        <div className="space-y-2">
                          {sec.items.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="w-4 h-4 rounded border border-border flex items-center justify-center text-[10px] text-muted-foreground" aria-hidden="true">□</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 text-xs bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition-colors">تعديل القالب</button>
                    <button className="px-4 py-2 text-xs bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">استخدام هذا القالب</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "custom" && (
        <>
          {/* ── Desktop Table View ── */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["الرقم", "اسم الفحص", "السيارة", "الفني", "التاريخ", "النقاط", "توقيع العميل", "التلفيات والتوثيق", "النتيجة", "الحالة"].map((h) => (
                    <th key={h} className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customInspections.map((insp) => (
                  <tr key={insp.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary text-xs">{insp.id}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{insp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{insp.car}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{insp.tech}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{insp.date}</td>
                    <td className="px-4 py-3 font-mono text-center text-foreground text-xs">{toArabicNum(insp.points)}</td>
                    <td className="px-4 py-3 text-center">
                      {insp.customerSignature
                        ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">✓ موقّع</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDamageModalInspection(insp)}
                        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          insp.damages && insp.damages.length > 0
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                            : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                        }`}
                        title="عرض وتوثيق التلفيات والصور"
                      >
                        <Camera size={12} />
                        {insp.damages && insp.damages.length > 0
                          ? `${toArabicNum(insp.damages.length)} تلف`
                          : "+ إضافة"}
                      </button>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={insp.result} /></td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`حالة فحص ${insp.name}`}
                        value={insp.status}
                        onChange={event => void updateInspection(insp.id, { status: event.target.value })}
                        className="bg-secondary text-foreground border border-border rounded-lg px-2 py-1 text-xs"
                      >
                        {["مجدول", "جاري", "مكتمل"].map(status => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Touch Cards View ── */}
          <div className="md:hidden space-y-3">
            {customInspections.map((insp) => (
              <div
                key={insp.id}
                className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm hover:border-primary/40 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-primary text-xs font-bold">{insp.id}</span>
                    <StatusBadge status={insp.result} />
                  </div>
                  <select
                    aria-label={`حالة فحص ${insp.name}`}
                    value={insp.status}
                    onChange={(e) => void updateInspection(insp.id, { status: e.target.value })}
                    className="bg-secondary text-foreground border border-border rounded-lg px-2 py-1 text-xs font-medium"
                  >
                    {["مجدول", "جاري", "مكتمل"].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Title & Vehicle */}
                <div>
                  <h4 className="font-bold text-foreground text-sm">{insp.name}</h4>
                  <p className="text-xs text-primary font-medium mt-0.5">{insp.car}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/50 rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">الفني المسؤول:</span>
                    <span className="font-medium text-foreground">{insp.tech}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">التاريخ:</span>
                    <span className="text-foreground">{insp.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">نقاط الفحص:</span>
                    <span className="font-mono text-foreground font-semibold">{toArabicNum(insp.points)} نقطة</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">توقيع العميل:</span>
                    <span>
                      {insp.customerSignature ? (
                        <span className="text-emerald-400 font-medium">✓ موقّع</span>
                      ) : (
                        <span className="text-muted-foreground">غير موقّع</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Camera / Damage Action Button */}
                <button
                  type="button"
                  onClick={() => setDamageModalInspection(insp)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-foreground text-xs font-semibold border border-border transition-all"
                >
                  <Camera size={15} className="text-primary" />
                  <span>
                    توثيق التلفيات والصور بالكاميرا{" "}
                    {insp.damages && insp.damages.length > 0 && `(${toArabicNum(insp.damages.length)})`}
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* ── Damage Photos Modal ── */}
          {damageModalInspection && (
            <DamagePhotoModal
              open={Boolean(damageModalInspection)}
              onClose={() => setDamageModalInspection(null)}
              inspectionTitle={damageModalInspection.name}
              vehicleName={damageModalInspection.car}
              damages={(damageModalInspection.damages || []) as DamageItem[]}
              onSaveDamages={(updatedDamages) => {
                void updateInspection(damageModalInspection.id, {
                  damages: updatedDamages.map((d) => ({
                    location: d.location,
                    note: d.note,
                    hasPhoto: d.hasPhoto,
                    photoUrl: d.photoUrl,
                  })),
                });
              }}
            />
          )}
        </>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="إنشاء فحص مخصص"
        maxWidth="max-w-lg"
        actions={
          <>
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveInspection} disabled={!form.name || !form.car || !form.tech || !form.template} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إنشاء</button>
          </>
        }
      >
        <FormField label="اسم الفحص" htmlFor="insp-name">
          <input id="insp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: فحص ما قبل السفر" className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="السيارة" htmlFor="insp-car">
            <select id="insp-car" value={form.car} onChange={(e) => setForm({ ...form, car: e.target.value })} className={inputClass}>
              <option value="">اختر السيارة</option>
              {vehicles.map((v) => <option key={v.vin}>{v.plate} — {v.make} {v.model}</option>)}
            </select>
          </FormField>
          <FormField label="الفني" htmlFor="insp-tech">
            <select id="insp-tech" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} className={inputClass}>
              <option value="">اختر الفني</option>
              {technicians.map((t) => <option key={t.id}>{t.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="القالب الأساسي (اختياري)" htmlFor="insp-tmpl">
          <select id="insp-tmpl" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className={inputClass}>
            <option value="">— بدون قالب —</option>
            {inspectionTemplates.map((t) => <option key={t.id}>{t.name}</option>)}
          </select>
        </FormField>
        <FormField label="ملاحظات" htmlFor="insp-notes">
          <textarea id="insp-notes" rows={3} placeholder="تعليمات أو نقاط إضافية..." className={`${inputClass} resize-none`} />
        </FormField>
      </Modal>
    </div>
  );
}
