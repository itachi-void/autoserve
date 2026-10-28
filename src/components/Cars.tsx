import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import type { Vehicle } from "../data/types";
import SearchBox from "./ui/SearchBox";
import PageHeader from "./ui/PageHeader";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import StatusBadge from "./ui/StatusBadge";
import EmptyState from "./ui/EmptyState";
import { useToast } from "../data/ToastContext";

export default function Cars() {
  const { vehicles, customers, workOrders, addVehicle, setVehicles, setCustomers, dataSource } = useAppData();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ plate: "", make: "", model: "", year: "", owner: "" });

  // Per-car action modals
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [modal, setModal] = useState<"history" | "edit" | "transfer" | null>(null);
  const [editForm, setEditForm] = useState({ plate: "", make: "", model: "", year: "", color: "", mileage: "" });
  const [newOwner, setNewOwner] = useState("");

  const openModal = (car: Vehicle, type: "history" | "edit" | "transfer") => {
    setSelected(car);
    if (type === "edit") setEditForm({ plate: car.plate, make: car.make, model: car.model, year: car.year, color: car.color, mileage: String(car.mileage) });
    if (type === "transfer") setNewOwner("");
    setModal(type);
  };
  const closeModal = () => { setSelected(null); setModal(null); };

  const saveEdit = async () => {
    if (!selected || !editForm.plate || !editForm.make || !editForm.model) return;
    if ((await setVehicles((prev) =>
      prev.map((v) => v.vin === selected.vin ? { ...v, ...editForm, mileage: Number(editForm.mileage) || v.mileage } : v)
    )) === false) return;
    toast(`تم تحديث بيانات ${editForm.make} ${editForm.model}`);
    closeModal();
  };

  const saveTransfer = async () => {
    if (!selected || !newOwner || newOwner === selected.owner) return;
    if ((await setVehicles((prev) => prev.map((v) => v.vin === selected.vin ? { ...v, owner: newOwner } : v))) === false) return;
    if (dataSource !== "api" && (await setCustomers((prev) =>
      prev.map((c) => {
        if (c.name === selected.owner) return { ...c, cars: Math.max(0, c.cars - 1) };
        if (c.name === newOwner) return { ...c, cars: c.cars + 1 };
        return c;
      })
    )) === false) return;
    toast(`تم نقل ملكية السيارة إلى ${newOwner}`);
    closeModal();
  };

  const saveVehicle = async () => {
    if (!form.plate || !form.make || !form.model || !form.year || !form.owner) return;
    if ((await addVehicle({ ...form, color: "غير محدد", mileage: 0, lastService: "لم تُسجل خدمة", vin: `VIN-${Date.now()}` })) === false) return;
    toast(`تم تسجيل سيارة ${form.make} ${form.model} بنجاح`);
    setForm({ plate: "", make: "", model: "", year: "", owner: "" }); setShowAdd(false);
  };

  const filtered = vehicles.filter(
    (c) => c.plate.includes(search) || c.owner.includes(search) || c.make.includes(search) || c.model.includes(search)
  );

  const carHistory = selected
    ? workOrders.filter((o) => o.car.includes(selected.make) && o.car.includes(selected.model))
    : [];

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="إدارة السيارات"
        subtitle={`${toArabicNum(vehicles.length)} سيارة مسجلة`}
        actions={
          <>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              📋 كتالوج السيارات
            </button>
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
              + تسجيل سيارة
            </button>
          </>
        }
      />

      <SearchBox value={search} onChange={setSearch} placeholder="البحث بلوحة الترقيم أو المالك أو الماركة..." id="cars-search" />

      {filtered.length === 0 && (
        <EmptyState
          icon="🚗"
          title={search ? "لا توجد نتائج" : "لا توجد سيارات مسجلة"}
          subtitle={search ? `لم يُعثر على سيارة تطابق "${search}"` : "ابدأ بتسجيل أول سيارة في النظام"}
          action={search ? undefined : { label: "+ تسجيل سيارة", onClick: () => setShowAdd(true) }}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((car) => (
          <div key={car.vin} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-foreground">{car.make} {car.model}</div>
                <div className="text-sm text-muted-foreground">{car.year} · {car.color}</div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 font-mono text-primary text-sm font-semibold" dir="ltr">
                {car.plate}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground/60 text-xs mb-0.5">المالك</div>
                <div className="text-foreground">{car.owner}</div>
              </div>
              <div>
                <div className="text-muted-foreground/60 text-xs mb-0.5">قراءة العداد</div>
                <div className="text-foreground font-mono">{toArabicNum(car.mileage)} كم</div>
              </div>
              {car.trim && (
                <div>
                  <div className="text-muted-foreground/60 text-xs mb-0.5">الفئة</div>
                  <div className="text-foreground text-xs font-mono">{car.trim}</div>
                </div>
              )}
              {car.registeredAt && (
                <div>
                  <div className="text-muted-foreground/60 text-xs mb-0.5">تسجيل</div>
                  <div className="text-muted-foreground text-xs">{car.registeredAt}</div>
                </div>
              )}
              <div>
                <div className="text-muted-foreground/60 text-xs mb-0.5">آخر خدمة</div>
                <div className="text-muted-foreground text-xs">{car.lastService}</div>
              </div>
              <div>
                <div className="text-muted-foreground/60 text-xs mb-0.5">VIN</div>
                <div className="text-muted-foreground font-mono text-[10px]" dir="ltr">{car.vin.slice(0, 12)}...</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button
                onClick={(e) => { e.stopPropagation(); openModal(car, "history"); }}
                className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-border hover:border-primary/20"
              >
                📊 السجل
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openModal(car, "edit"); }}
                className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-sky-400 hover:bg-sky-500/5 rounded-lg transition-colors border border-border hover:border-sky-500/20"
              >
                ✏️ تعديل
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openModal(car, "transfer"); }}
                className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors border border-border hover:border-emerald-500/20"
              >
                👤 نقل ملكية
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Register new car ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="تسجيل سيارة" actions={
        <>
          <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button>
          <button onClick={saveVehicle} disabled={Object.values(form).some((v) => !v)} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">تسجيل السيارة</button>
        </>
      }>
        <FormField label="المالك" htmlFor="car-owner">
          <select id="car-owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputClass}>
            <option value="">اختر العميل</option>
            {customers.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="رقم اللوحة" htmlFor="car-plate"><input id="car-plate" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className={inputClass} /></FormField>
          <FormField label="السنة" htmlFor="car-year"><input id="car-year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="الماركة" htmlFor="car-make"><input id="car-make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className={inputClass} /></FormField>
          <FormField label="الطراز" htmlFor="car-model"><input id="car-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} /></FormField>
        </div>
      </Modal>

      {/* ── Service History ── */}
      <Modal open={modal === "history"} onClose={closeModal} title={`سجل خدمة — ${selected?.make} ${selected?.model}`}>
        {carHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">لا توجد أوامر تشغيل مسجلة لهذه السيارة</p>
        ) : (
          <>
            <div className="space-y-2">
              {carHistory.map((o) => (
                <div key={o.id} className="bg-secondary rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-primary text-xs font-semibold">{o.id}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-sm text-foreground">{o.services.join("، ")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">الفني: {o.tech} · {o.date}</div>
                    {o.startedAt && <div className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">بدأ: {o.startedAt}{o.completedAt ? ` · اكتمل: ${o.completedAt}` : ""}</div>}
                    {o.notes && <div className="text-[10px] text-amber-400 mt-0.5">📝 {o.notes}</div>}
                  </div>
                  <div className="text-sm font-mono font-semibold text-foreground flex-shrink-0">{toArabicNum(o.total)} ر.س</div>
                </div>
              ))}
            </div>
            {selected?.ownershipHistory && selected.ownershipHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground font-mono mb-2">سجل الملكية:</div>
                <div className="flex flex-wrap gap-2">
                  {selected.ownershipHistory.map((owner, i) => (
                    <span key={i} className="text-xs bg-secondary border border-border rounded-lg px-2 py-1 text-foreground">{owner}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ── Edit Car ── */}
      <Modal open={modal === "edit"} onClose={closeModal} title={`تعديل — ${selected?.make} ${selected?.model}`} actions={
        <>
          <button onClick={closeModal} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button>
          <button onClick={saveEdit} disabled={!editForm.plate || !editForm.make || !editForm.model} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">حفظ التعديلات</button>
        </>
      }>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="رقم اللوحة" htmlFor="edit-plate"><input id="edit-plate" value={editForm.plate} onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })} className={inputClass} /></FormField>
          <FormField label="السنة" htmlFor="edit-year"><input id="edit-year" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="الماركة" htmlFor="edit-make"><input id="edit-make" value={editForm.make} onChange={(e) => setEditForm({ ...editForm, make: e.target.value })} className={inputClass} /></FormField>
          <FormField label="الطراز" htmlFor="edit-model"><input id="edit-model" value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="اللون" htmlFor="edit-color"><input id="edit-color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className={inputClass} /></FormField>
          <FormField label="قراءة العداد (كم)" htmlFor="edit-mileage"><input id="edit-mileage" type="number" min="0" value={editForm.mileage} onChange={(e) => setEditForm({ ...editForm, mileage: e.target.value })} className={inputClass} /></FormField>
        </div>
      </Modal>

      {/* ── Transfer Ownership ── */}
      <Modal open={modal === "transfer"} onClose={closeModal} title={`نقل ملكية — ${selected?.make} ${selected?.model}`} actions={
        <>
          <button onClick={closeModal} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button>
          <button onClick={saveTransfer} disabled={!newOwner || newOwner === selected?.owner} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:brightness-110 transition-all">تأكيد النقل</button>
        </>
      }>
        {selected && (
          <div className="mb-4 bg-secondary rounded-xl p-3 text-sm flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <div className="font-semibold text-foreground">{selected.make} {selected.model} {selected.year}</div>
              <div className="text-xs text-muted-foreground">المالك الحالي: <span className="text-primary font-medium">{selected.owner}</span></div>
            </div>
          </div>
        )}
        <FormField label="المالك الجديد" htmlFor="transfer-owner">
          <select id="transfer-owner" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className={inputClass}>
            <option value="">اختر العميل الجديد</option>
            {customers.filter((c) => c.name !== selected?.owner).map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>
        {newOwner && (
          <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 rounded-lg p-2">
            سيتم نقل الملكية من <span className="text-foreground font-medium">{selected?.owner}</span> إلى <span className="text-emerald-400 font-medium">{newOwner}</span> وتحديث سجلات العملاء تلقائياً.
          </p>
        )}
      </Modal>
    </div>
  );
}
