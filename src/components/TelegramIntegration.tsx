import { useEffect, useId, useState } from "react";
import { Send, Link2, RefreshCw } from "lucide-react";
import { API_ENABLED, gql } from "../data/api";
import { useAppData } from "../data/AppDataContext";
import FormField, { inputClass } from "./ui/FormField";
import TelegramSetup, { statusFields, type BotStatus } from "./TelegramSetup";

const statusQuery = `query { telegramStatus { ${statusFields} } }`;
const integrationError = (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : "تعذّر تنفيذ الطلب";
  return ["botUsername", "ownBot", "configureTelegramBot", "removeTelegramBot"].some(field => message.includes(field))
    ? "الواجهة تحتاج الباك اند المحدّث لدعم البوت الخاص. حدّث backend/src وأعد بناء حاوية API، ثم اضغط تحقّق من الاتصال."
    : message;
};

export default function TelegramIntegration() {
  const { purchaseOrders, quotations, workOrders, refresh, loading, error: workspaceError } = useAppData();
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState("");
  const [scenario, setScenario] = useState("shipping");
  const [recordId, setRecordId] = useState("");
  const fieldId = useId();
  const records = scenario === "shipping" ? purchaseOrders : scenario === "customer" ? quotations : workOrders;
  const availableRecords = records.filter(record => record.apiId);
  const emptyGuidance = scenario === "shipping"
    ? "أنشئ مورداً وقطعة غيار، ثم طلب شراء مفتوحاً من صفحة التوريد / أوامر الشراء."
    : scenario === "customer"
      ? "أنشئ عميلاً وسيارة وخدمة، ثم عرض سعر ينتظر موافقة العميل وله تاريخ صلاحية مستقبلي."
      : "أنشئ أمر تشغيل من عرض سعر موافق عليه، واتركه مفتوحاً للاختبار.";
  const readStatus = async () => setStatus((await gql<{ telegramStatus: BotStatus }>(statusQuery)).telegramStatus);
  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    gql<{ telegramStatus: BotStatus }>(statusQuery)
      .then(data => { if (active) setStatus(data.telegramStatus); })
      .catch(reason => { if (active) setError(integrationError(reason)); });
    return () => { active = false; };
  }, []);

  const run = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await operation(); }
    catch (reason) { setError(integrationError(reason)); }
    finally { setBusy(false); }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-5" aria-labelledby={`${fieldId}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3"><span className="p-3 rounded-xl bg-primary/10 text-primary self-start"><Send size={22} /></span><div><h2 id={`${fieldId}-title`} className="font-bold text-foreground">مختبر Telegram</h2><p className="text-sm text-muted-foreground mt-1">حساب واحد · ثلاثة أدوار · تحديثات فعلية في النظام</p></div></div>
        <span className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground">{!API_ENABLED ? "الوضع التجريبي — الإرسال غير متاح" : status?.connected ? `متصل${status.username ? ` · @${status.username}` : ""}` : status?.configured && status.simulationEnabled ? "بانتظار ربط الحساب" : status ? "يحتاج إعداد الباك اند" : "جارٍ التحقق"}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-7">هذه محاكاة تشغيلية، وليست رسائل وهمية: استلام الشحنة يزيد المخزون، وقرار العميل يغيّر عرض السعر، وموظف المركز يحدّث أمر التشغيل. استخدم بيانات اختبار، فالأزرار تعدّل قاعدة البيانات فعلاً.</p>
      {API_ENABLED && <p className="text-xs text-muted-foreground">تتم مزامنة وحدات النظام تلقائياً كل ١٠ ثوانٍ أثناء فتح التبويب، وكذلك عند الرجوع إليه من Telegram. ويمكنك تحديث البيانات يدوياً.</p>}
      <TelegramSetup status={status} busy={busy} run={run} onConfigured={next => { setStatus(next); setLink(""); setNotice(next.ownBot ? "تم حفظ البوت الخاص. أنشئ رابطاً آمناً واضغط Start لربط حسابك." : "تم حذف البوت الخاص من هذه المساحة."); }} />
      {!API_ENABLED ? <p className="text-sm text-muted-foreground">يلزم تشغيل الباك اند وضبط VITE_API_URL قبل الربط. لن نعرض نجاح إرسال تجريبي.</p> : <>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || !status?.configured || !status.simulationEnabled} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40 flex items-center gap-2" onClick={() => void run(async () => { const data = await gql<{ createTelegramLink: string }>("mutation { createTelegramLink }"); setLink(data.createTelegramLink); setNotice("افتح الرابط من حسابك واضغط Start، ثم تحقّق من الاتصال. الرابط صالح لعشر دقائق؛ لا تشاركه."); })}><Link2 size={16} />{status?.connected ? "ربط حساب بديل" : "إنشاء رابط آمن"}</button>
          <button type="button" disabled={busy} className="border border-border text-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40 flex items-center gap-2" onClick={() => void run(readStatus)}><RefreshCw size={16} />تحقّق من الاتصال</button>
          {status?.connected && <button type="button" disabled={busy} className="border border-border text-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40" onClick={() => void run(async () => { await gql("mutation { disconnectTelegram }"); setLink(""); await readStatus(); })}>فصل الربط</button>}
        </div>
        {link && <a href={link} target="_blank" rel="noopener noreferrer" className="block text-primary text-sm underline break-all" dir="ltr">فتح رابط الربط في Telegram ↗</a>}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="دور الحساب في الرسالة" htmlFor={`${fieldId}-role`}><select id={`${fieldId}-role`} value={scenario} disabled={busy} className={inputClass} onChange={event => { setScenario(event.target.value); setRecordId(""); }}><option value="shipping">شركة الشحن — طلب شراء</option><option value="customer">العميل — عرض سعر</option><option value="employee">موظف المركز — أمر تشغيل</option></select></FormField>
          <FormField label="السجل الفعلي" htmlFor={`${fieldId}-record`}><select id={`${fieldId}-record`} value={recordId} disabled={busy || loading || !availableRecords.length} className={inputClass} onChange={event => setRecordId(event.target.value)}><option value="">{loading ? "جارٍ تحميل السجلات…" : availableRecords.length ? "اختر السجل" : "لا توجد سجلات فعلية متاحة"}</option>{availableRecords.map(record => <option key={record.apiId} value={record.apiId}>{record.id} · {record.status}</option>)}</select></FormField>
        </div>
        {workspaceError ? <p role="alert" className="text-sm text-destructive">تعذّر تحميل سجلات النظام: {workspaceError}. اضغط تحديث بيانات النظام لإعادة المحاولة.</p> : !loading && !availableRecords.length && <div role="status" className="bg-secondary rounded-xl p-4 text-sm space-y-2"><p className="font-semibold text-foreground">الربط لا ينشئ سجلات تلقائياً</p><p className="text-muted-foreground">{emptyGuidance} بيانات الواجهة التجريبية ليست سجلات في قاعدة البيانات المحلية. بعد الإنشاء، ارجع هنا واضغط تحديث بيانات النظام.</p></div>}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || loading || !!workspaceError || !status?.connected || !status.simulationEnabled || !availableRecords.some(record => record.apiId === recordId)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40" onClick={() => void run(async () => { await gql("mutation Send($scenario: String!, $recordId: UUID!) { sendTelegramSimulation(scenario: $scenario, recordId: $recordId) }", { scenario, recordId }); setNotice("وصلت الرسالة إلى Telegram. اضغط أحد أزرارها، ثم حدّث بيانات النظام هنا."); })}>{busy ? "جارٍ التنفيذ…" : "إرسال الرسالة بأزرار الإجراء"}</button>
          <button type="button" disabled={busy || !refresh} className="border border-border text-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40" onClick={() => void run(async () => { if (await refresh?.()) setNotice("تم تحديث بيانات النظام."); else throw new Error("تعذّر تحديث بيانات النظام"); })}>تحديث بيانات النظام</button>
        </div>
      </>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
    </section>
  );
}
