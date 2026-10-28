import { useEffect, useId, useState } from "react";
import Modal from "./Modal";
import FormField, { inputClass } from "./FormField";
import { useAppData } from "../../data/AppDataContext";

export interface RecordField {
  name: string; label: string; type?: "text" | "number" | "email" | "date" | "textarea";
  options?: string[]; required?: boolean; defaultValue?: string;
}

export default function RecordFormModal({ open, onClose, title, fields, onSave }: { open: boolean; onClose: () => void; title: string; fields: RecordField[]; onSave: (values: Record<string, string>) => void | Promise<boolean | void> }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formId = useId();
  const { pending } = useAppData();
  useEffect(() => { if (open) { setValues(Object.fromEntries(fields.map(field => [field.name, field.defaultValue ?? ""]))); setAttempted(false); setError(""); } }, [open]);
  const issue = (field: RecordField) => {
    const value = values[field.name]?.trim() ?? "";
    if (field.required !== false && !value) return `أدخل ${field.label}`;
    if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "أدخل بريداً إلكترونياً صالحاً";
    if (value && field.type === "number" && (!Number.isFinite(Number(value)) || Number(value) < 0)) return "أدخل رقماً لا يقل عن صفر";
    return "";
  };
  const save = async () => { setAttempted(true); if (pending || saving || fields.some(field => issue(field))) return; setSaving(true); setError(""); try { if ((await onSave(values)) !== false) onClose(); } catch { setError("تعذّر الحفظ. راجع البيانات وحاول مرة أخرى."); } finally { setSaving(false); } };
  return <Modal open={open} onClose={onClose} onEnterSubmit={save} title={title} actions={<><button onClick={onClose} disabled={pending || saving} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl">إلغاء</button><button onClick={save} disabled={pending || saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-50">{pending || saving ? "جاري الحفظ…" : "حفظ"}</button></>}><p className="text-xs text-muted-foreground">الحقول المميزة بـ * مطلوبة.</p>{fields.map(field => { const identifier = `${formId}-${field.name}`; const message = attempted ? issue(field) : ""; const shared = { id: identifier, value: values[field.name] ?? "", "aria-invalid": Boolean(message), "aria-describedby": message ? `${identifier}-error` : undefined, className: inputClass, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues(previous => ({ ...previous, [field.name]: event.target.value })) }; return <FormField key={field.name} htmlFor={identifier} label={`${field.label}${field.required === false ? " (اختياري)" : " *"}`}>{field.options ? <select {...shared}><option value="">اختر</option>{field.options.map(option => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea {...shared} rows={4} /> : <input {...shared} type={field.type ?? "text"} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? "any" : undefined} />}{message && <p id={`${identifier}-error`} className="field-error" role="alert">{message}</p>}</FormField>; })}{error && <p className="field-error" role="alert">{error}</p>}</Modal>;
}
